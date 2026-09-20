import { Component } from "@angular/core"
import { AuthComponent } from "../../components/auth/auth.component"

@Component({
	selector: "app-login-page",
	imports: [AuthComponent],
	templateUrl: "./login-page.component.html"
})
export class LoginPageComponent {}
