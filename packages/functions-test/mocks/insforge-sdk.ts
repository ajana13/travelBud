type MockUser = { id: string; [key: string]: unknown } | null;

let _mockUser: MockUser = null;
let _lastOpts: Record<string, unknown> | null = null;

export function setMockUser(user: MockUser) {
  _mockUser = user;
}

export function getLastCreateClientOpts() {
  return _lastOpts;
}

export function resetMock() {
  _mockUser = null;
  _lastOpts = null;
}

export function createClient(opts: Record<string, unknown>) {
  _lastOpts = { ...opts };
  return {
    auth: {
      async getCurrentUser() {
        return { data: _mockUser ? { user: _mockUser } : null };
      },
    },
  };
}
