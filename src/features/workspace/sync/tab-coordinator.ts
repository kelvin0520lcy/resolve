export type SyncLeaderLease = {
  tabId: string;
  acquiredAt: number;
  expiresAt: number;
};

export type WorkspaceTabMessage<T = unknown> = {
  type: "workspace-change" | "sync-complete" | "sync-request";
  tabId: string;
  payload?: T;
};

const HEARTBEAT_MS = 2_000;
const LEASE_MS = 7_000;

export function createTabId() {
  return `tab-${crypto.randomUUID()}`;
}

export function canAcquireLease(
  lease: SyncLeaderLease | null,
  tabId: string,
  now: number,
) {
  return !lease || lease.tabId === tabId || lease.expiresAt <= now;
}

export class TabSyncCoordinator<T = unknown> {
  readonly tabId: string;
  private readonly channelName: string;
  private readonly leaseKey: string;
  private channel: BroadcastChannel | null = null;
  private timer: number | null = null;
  private stopped = true;
  private releaseLock: (() => void) | null = null;
  private leadershipHandler: (leader: boolean) => void = () => {};
  private messageHandler: (message: WorkspaceTabMessage<T>) => void = () => {};
  private leader = false;

  constructor(identity: string, tabId = createTabId()) {
    this.tabId = tabId;
    this.channelName = `resolve-sync:${identity}`;
    this.leaseKey = `resolve-sync-leader:${identity}`;
  }

  start(
    onLeadershipChange: (leader: boolean) => void,
    onMessage: (message: WorkspaceTabMessage<T>) => void,
  ) {
    this.stopped = false;
    this.leadershipHandler = onLeadershipChange;
    this.messageHandler = onMessage;
    if (typeof BroadcastChannel !== "undefined") {
      this.channel = new BroadcastChannel(this.channelName);
      this.channel.onmessage = (event: MessageEvent<WorkspaceTabMessage<T>>) => {
        if (event.data?.tabId !== this.tabId) this.messageHandler(event.data);
      };
    }
    this.scheduleElection(0);
  }

  publish(message: Omit<WorkspaceTabMessage<T>, "tabId">) {
    this.channel?.postMessage({ ...message, tabId: this.tabId });
  }

  requestSync() {
    this.publish({ type: "sync-request" });
  }

  private setLeader(leader: boolean) {
    if (this.leader === leader) return;
    this.leader = leader;
    this.leadershipHandler(leader);
  }

  private scheduleElection(delay = HEARTBEAT_MS) {
    if (this.stopped) return;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = window.setTimeout(() => void this.elect(), delay);
  }

  private async electWithWebLocks() {
    const locks = navigator.locks;
    let receivedLock = false;
    await locks.request(
      this.channelName,
      { ifAvailable: true },
      async (lock) => {
        if (!lock || this.stopped) return;
        receivedLock = true;
        this.setLeader(true);
        await new Promise<void>((resolve) => {
          this.releaseLock = resolve;
        });
        this.releaseLock = null;
        this.setLeader(false);
      },
    );
    if (!receivedLock) this.setLeader(false);
  }

  private readLease(): SyncLeaderLease | null {
    try {
      const value = JSON.parse(
        window.localStorage.getItem(this.leaseKey) ?? "null",
      ) as SyncLeaderLease | null;
      return value &&
        typeof value.tabId === "string" &&
        Number.isFinite(value.expiresAt)
        ? value
        : null;
    } catch {
      return null;
    }
  }

  private electWithLease() {
    const now = Date.now();
    const lease = this.readLease();
    if (!canAcquireLease(lease, this.tabId, now)) {
      this.setLeader(false);
      return;
    }
    const nextLease: SyncLeaderLease = {
      tabId: this.tabId,
      acquiredAt: lease?.tabId === this.tabId ? lease.acquiredAt : now,
      expiresAt: now + LEASE_MS,
    };
    try {
      window.localStorage.setItem(this.leaseKey, JSON.stringify(nextLease));
      this.setLeader(this.readLease()?.tabId === this.tabId);
    } catch {
      // When storage is unavailable, duplicate sync is safer than no sync.
      this.setLeader(true);
    }
  }

  private async elect() {
    if (this.stopped) return;
    try {
      if (typeof navigator !== "undefined" && navigator.locks) {
        await this.electWithWebLocks();
      } else {
        this.electWithLease();
      }
    } finally {
      this.scheduleElection();
    }
  }

  stop() {
    this.stopped = true;
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
    this.releaseLock?.();
    this.releaseLock = null;
    if (this.leader && !(typeof navigator !== "undefined" && navigator.locks)) {
      try {
        const lease = this.readLease();
        if (lease?.tabId === this.tabId) {
          window.localStorage.removeItem(this.leaseKey);
        }
      } catch {
        // The expiring lease transfers leadership after a crashed tab.
      }
    }
    this.setLeader(false);
    this.channel?.close();
    this.channel = null;
  }
}
