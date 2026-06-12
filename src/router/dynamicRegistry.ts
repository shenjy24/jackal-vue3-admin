const routeRemovers: Array<() => void> = [];

export function registerDynamicRouteRemover(remover: () => void) {
  routeRemovers.push(remover);
}

export function resetDynamicRoutes() {
  routeRemovers.splice(0).forEach((removeRoute) => removeRoute());
}
