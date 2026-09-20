import { Component } from "@angular/core"
import { DeveloperComponent } from "../../components/developer/developer.component"

@Component({
	selector: "app-dev-page",
	imports: [DeveloperComponent],
	templateUrl: "./dev-page.component.html"
})
export class DevPageComponent {}
