import { NavigationActions } from 'react-navigation';
import type { NavigationParams, NavigationRoute } from 'react-navigation';

let _container; // eslint-disable-line

function setContainer(container: Object) {
  _container = container;
}

function navigate(routeName: string, params?: NavigationParams) {
  _container.dispatch(
    NavigationActions.navigate({
      type: 'Navigation/NAVIGATE',
      routeName,
      params
    })
  );
}

export default {
  setContainer,
  navigate
};