import type { Route } from '@lifi/sdk';
import { executeRoute } from '@/lib/lifi';

export type RouteUpdateCallback = (updatedRoute: Route) => void;

export async function executeLifiRoute(
  route: Route,
  onUpdate: RouteUpdateCallback
) {
  try {
    const executedRoute = await executeRoute(route, {
      updateRouteHook(updatedRoute: Route) {
        onUpdate(updatedRoute);
      },
    });
    return executedRoute;
  } catch (error) {
    console.error("Route execution failed:", error);
    throw error;
  }
}
