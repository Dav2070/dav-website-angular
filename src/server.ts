import {
	AngularNodeAppEngine,
	createNodeRequestHandler,
	isMainModule
} from "@angular/ssr/node"
import express from "express"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { WebsiteBackend } from "./server/backend"
import { getLocale } from "./locales"

const serverFolder = dirname(fileURLToPath(import.meta.url))
const browserFolder = resolve(serverFolder, "../browser")
const allowed = (process.env["BASE_URL"] || "http://localhost:3000")
	.split(",")
	.map(url => new URL(url.trim()).hostname)
const engine = new AngularNodeAppEngine({
	allowedHosts: [...new Set([...allowed, "localhost", "127.0.0.1", "[::1]"])]
})
const app = express()
app.disable("x-powered-by")
app.use(
	express.static(browserFolder, {
		maxAge: "1y",
		index: false,
		redirect: false
	})
)
app.use(new WebsiteBackend().express)
app.use((req, res, next) => {
	if (req.path.startsWith("/api/"))
		return res.status(404).json({ errors: ["NOT_FOUND"] })
	res.vary("Accept-Language")
	res.setHeader("Cache-Control", "private, no-store")
	const page = res.locals.page || {
		name: "not-found",
		path: req.url,
		data: { lang: getLocale(req.acceptsLanguages(["en", "de"])).lang }
	}
	if (!res.locals.page) res.status(404)
	if (res.locals.pageRequest) return res.json(page)
	engine
		.handle(req, { page })
		.then(async response => {
			if (!response) return next()
			if (res.statusCode === 200) res.status(response.status)
			for (const header of ["content-type", "location"]) {
				const value = response.headers.get(header)
				if (value) res.setHeader(header, value)
			}
			const html = await response.text()
			const theme =
				req.headers.cookie?.match(
					/(?:^|; )dav-theme=(light|dark|system)(?:;|$)/
				)?.[1] || "system"
			res.send(html.replace("<html ", `<html data-theme="${theme}" `))
		})
		.catch(next)
})
app.use(
	(
		error: any,
		req: express.Request,
		res: express.Response,
		_next: express.NextFunction
	) => {
		console.error(
			"Request failed:",
			req.path,
			error?.message || "Unknown error"
		)
		if (res.headersSent) return
		res.status(503).setHeader("Cache-Control", "no-store")
		if (req.path.startsWith("/api/") || res.locals.pageRequest)
			res.json({ errors: ["SERVICE_UNAVAILABLE"] })
		else
			res.type("html").send(
				'<!doctype html><html lang="en"><title>dav – Service unavailable</title><h1>dav</h1><p>The service is temporarily unavailable. Please try again.</p><a href="/">Home</a></html>'
			)
	}
)
if (isMainModule(import.meta.url)) {
	const port = process.env["PORT"] || 3000
	app.listen(port, () =>
		console.log(`dav listening on http://localhost:${port}`)
	)
}
export const reqHandler = createNodeRequestHandler(app)
