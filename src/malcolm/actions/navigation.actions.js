import { replace, push } from 'react-router-redux';
import NavTypes from '../NavTypes';
import {
  malcolmNewBlockAction,
  malcolmSubscribeAction,
} from '../malcolmActionCreators';

const findBlockIndex = (navList, blockMri) => {
  const navLength = navList.length;
  const navListTrim =
    navLength && !(navLength % 2) ? navList.slice(-2) : navList.slice(-3);
  const index = navListTrim.findIndex(
    nav => nav.navType === NavTypes.Block && nav.blockMri === blockMri
  );
  return index !== -1 ? navLength - navListTrim.length + index : -1;
};

const subscribeToNewBlocksInRoute = () => (dispatch, getState) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;
  const { blocks } = state;

  const blocksInRoute = navigationLists.filter(
    nav => nav.navType === NavTypes.Block
  );
  const unsubscribedBlocks = blocksInRoute.filter(nav => !blocks[nav.blockMri]);

  unsubscribedBlocks.forEach(nav => {
    dispatch(malcolmNewBlockAction(nav.blockMri, false, false));
    dispatch(malcolmSubscribeAction([nav.blockMri, 'meta']));
  });
};

const navigateToAttribute = (blockMri, attributeName) => (
  dispatch,
  getState
) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;

  const matchingBlockNav = findBlockIndex(navigationLists, blockMri);
  if (matchingBlockNav > -1) {
    const newPath = `/gui/${navigationLists
      .filter((nav, i) => i <= matchingBlockNav)
      .map(nav => nav.path)
      .join('/')}/${attributeName}`;
    dispatch(push(newPath));
  }
};

const navigateToInfo = (blockMri, attributeName, subElement) => (
  dispatch,
  getState
) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;

  const matchingBlockNav = findBlockIndex(navigationLists, blockMri);

  if (matchingBlockNav > -1) {
    if (subElement !== undefined) {
      const newPath = `/gui/${navigationLists
        .filter((nav, i) => i <= matchingBlockNav)
        .map(nav => nav.path)
        .join('/')}/${attributeName}.${subElement}/.info`;
      dispatch(push(newPath));
    } else {
      const newPath = `/gui/${navigationLists
        .filter((nav, i) => i <= matchingBlockNav)
        .map(nav => nav.path)
        .join('/')}/${attributeName}/.info`;
      dispatch(push(newPath));
    }
  }
};

const navigateToSubElement = (blockMri, attributeName, subElement) => (
  dispatch,
  getState
) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;

  const matchingBlockNav = findBlockIndex(navigationLists, blockMri);

  if (matchingBlockNav > -1) {
    const newPath = `/gui/${navigationLists
      .filter((nav, i) => i <= matchingBlockNav)
      .map(nav => nav.path)
      .join('/')}/${attributeName}.${subElement}/${navigationLists
      .filter(
        (nav, i) =>
          (i > matchingBlockNav &&
            ![NavTypes.Attribute, NavTypes.SubElement].includes(nav.navType)) ||
          i > matchingBlockNav + 2
      )
      .map(nav => nav.path)
      .join('/')}`;
    dispatch(replace(newPath));
  }
};

const navigateToPalette = () => (dispatch, getState) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;

  const lastAttributeNav = [...navigationLists]
    .reverse()
    .findIndex(nav => nav.navType === NavTypes.Attribute);
  if (lastAttributeNav > -1) {
    const newPath = `/gui/${navigationLists
      .filter((nav, i) => i <= navigationLists.length - 1 - lastAttributeNav)
      .map(nav => nav.path)
      .join('/')}/.palette`;
    dispatch(push(newPath));
  }
};

const isChildPanelNavType = navType =>
  navType === NavTypes.Block ||
  navType === NavTypes.Info ||
  navType === NavTypes.Palette;

const closeChildPanel = () => (dispatch, getState) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;
  if (isChildPanelNavType(navigationLists.slice(-1)[0].navType)) {
    const newPath = `/gui/${navigationLists
      .slice(0, -1)
      .map(nav => nav.path)
      .join('/')}`;
    dispatch(push(newPath));
  }
};

const updateChildPanel = newChild => (dispatch, getState) => {
  const state = getState().malcolm;
  const { navigationLists } = state.navigation;

  let newPath;
  if (isChildPanelNavType(navigationLists.slice(-1)[0].navType)) {
    newPath = `/gui/${navigationLists
      .slice(0, -1)
      .map(nav => nav.path)
      .join('/')}/${newChild}`;
  } else {
    newPath = `/gui/${navigationLists
      .map(nav => nav.path)
      .join('/')}/${newChild}`;
  }
  dispatch(push(newPath));
};

export default {
  subscribeToNewBlocksInRoute,
  navigateToAttribute,
  navigateToInfo,
  navigateToSubElement,
  navigateToPalette,
  updateChildPanel,
  closeChildPanel,
};
