// Force-included header to disable Folly coroutines BEFORE any Folly headers
// This must be processed before folly/Portability.h defines FOLLY_HAS_COROUTINES

#ifndef FOLLY_CORO_DISABLED_BY_EXPO
#define FOLLY_CORO_DISABLED_BY_EXPO 1

// Disable Folly's coroutine support
#ifdef FOLLY_HAS_COROUTINES
#undef FOLLY_HAS_COROUTINES
#endif
#define FOLLY_HAS_COROUTINES 0

// Tell Folly explicitly no coroutines
#ifdef FOLLY_CFG_NO_COROUTINES
#undef FOLLY_CFG_NO_COROUTINES
#endif
#define FOLLY_CFG_NO_COROUTINES 1

#endif // FOLLY_CORO_DISABLED_BY_EXPO
