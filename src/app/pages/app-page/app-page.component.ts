import { Component } from "@angular/core"
import { DeveloperComponent } from "../../components/developer/developer.component"

@Component({
	selector: "app-app-page",
	imports: [DeveloperComponent],
	templateUrl: "./app-page.component.html"
})
export class AppPageComponent {}
