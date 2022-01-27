import { AuthService } from "@keekijanai/frontend-core";
import { createServiceProvider } from "@/common/service";

const { useProvider, Provider } = createServiceProvider(AuthService);

export { useProvider as useAuthService, Provider as AuthProvider };
