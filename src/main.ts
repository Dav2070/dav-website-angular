import "@dav-apps/ssr-angular/enable-lit-ssr.js"
import { bootstrapApplication } from "@angular/platform-browser"
import { AppComponent } from "./app/app.component"
import { appConfig } from "./app/app.config"

bootstrapApplication(AppComponent, appConfig).catch(console.error)
