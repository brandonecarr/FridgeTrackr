// Force-included header to disable Folly coroutines BEFORE any Folly headers
// This must be processed before folly/Portability.h defines FOLLY_HAS_COROUTINES

#ifdef FOLLY_HAS_COROUTINES
#undef FOLLY_HAS_COROUTINES
#endif
#define FOLLY_HAS_COROUTINES 0

#ifdef FOLLY_CFG_NO_COROUTINES
#undef FOLLY_CFG_NO_COROUTINES
#endif
#define FOLLY_CFG_NO_COROUTINES 1

// Also disable the C++20 coroutine feature test macros that Folly checks
#ifdef __cpp_impl_coroutine
#undef __cpp_impl_coroutine
#endif

#ifdef __cpp_lib_coroutine
#undef __cpp_lib_coroutine
#endif
