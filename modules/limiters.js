

const {rateLimit} = require('express-rate-limit')
const accountCreateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hr
	limit: 3, 
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
const ddosProtection = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 min
	limit: 100, 
	standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})
exports.ddosProtection = ddosProtection
exports.accountCreateLimiter = accountCreateLimiter
exports.rateLimit = function(windowMs, limit) {
	return rateLimit({
		windowMs: windowMs,
		limit: limit, 
		standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
		legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	})
}