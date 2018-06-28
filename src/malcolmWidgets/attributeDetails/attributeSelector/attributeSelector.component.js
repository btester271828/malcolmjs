import React from 'react';
import PropTypes from 'prop-types';
import { withTheme } from '@material-ui/core/styles';
import { BugReport } from '@material-ui/icons';
import { connect } from 'react-redux';
import WidgetLED from '../../led/widgetLED.component';
import WidgetCheckbox from '../../checkbox/checkbox.component';
import WidgetComboBox from '../../comboBox/comboBox.component';
import WidgetTextInput from '../../textInput/WidgetTextInput.component';
import TextUpdate from '../../textUpdate/WidgetTextUpdate.component';
import {
  malcolmPutAction,
  malcolmSetFlag,
} from '../../../malcolm/malcolmActionCreators';
import ButtonAction from '../../buttonAction/buttonAction.component';

export const selectorFunction = (
  widgetTag,
  path,
  value,
  valueHandler,
  flags,
  flagHandler,
  colorLED,
  objectMeta,
  forceUpdate,
  continuousSend = false
) => {
  switch (widgetTag) {
    case 'widget:led':
      return (
        <WidgetLED
          LEDState={value}
          colorBorder={colorLED}
          colorCenter={colorLED}
        />
      );
    case 'widget:checkbox':
      return (
        <WidgetCheckbox
          CheckState={value}
          Pending={flags.isDisabled}
          checkEventHandler={isChecked => valueHandler(path, isChecked)}
        />
      );
    case 'widget:combo':
      return (
        <WidgetComboBox
          Value={value}
          Pending={flags.isDisabled}
          Choices={objectMeta.choices}
          selectEventHandler={event => valueHandler(path, event.target.value)}
        />
      );
    case 'widget:textupdate':
      return <TextUpdate Text={value} />;
    case 'widget:textinput':
      return (
        <WidgetTextInput
          Error={flags.isErrorState}
          Value={value.toString()}
          Pending={flags.isDisabled}
          submitEventHandler={event => valueHandler(path, event.target.value)}
          isDirty={flags.isDirty}
          setFlag={(flag, state) => flagHandler(path, flag, state)}
          focusHandler={() => {}}
          blurHandler={() => {}}
          forceUpdate={forceUpdate}
          continuousSend={continuousSend}
        />
      );
    case 'widget:flowgraph':
      return <ButtonAction text="View" clickAction={() => {}} />;
    case 'widget:table':
      return <ButtonAction text="View" clickAction={() => {}} />;
    default:
      if (widgetTag.split(':')[0] === 'widget') {
        return <BugReport styles={{ color: 'red' }} />;
      }
      throw new Error('no widget tag supplied!');
  }
};

const AttributeSelector = props => {
  if (props.attribute && props.attribute.meta && props.attribute.meta.tags) {
    const { tags } = props.attribute.meta;
    const widgetTagIndex = tags.findIndex(t => t.indexOf('widget:') !== -1);
    const flags = {
      isDirty: props.attribute.dirty,
      isDisabled: props.attribute.pending || !props.attribute.meta.writeable,
      isErrorState: props.attribute.errorState,
    };

    if (widgetTagIndex !== -1) {
      return selectorFunction(
        tags[widgetTagIndex],
        props.attribute.path,
        props.attribute.value,
        props.eventHandler,
        flags,
        props.setFlag,
        props.theme.palette.primary.light,
        props.attribute.meta,
        props.attribute.forceUpdate
      );
    }
  }
  return null;
};

const mapStateToProps = () => ({});

const mapDispatchToProps = dispatch => ({
  eventHandler: (path, value) => {
    dispatch(malcolmSetFlag(path, 'pending', true));
    dispatch(malcolmPutAction(path, value));
  },
  setFlag: (path, flag, state) => {
    dispatch(malcolmSetFlag(path, flag, state));
  },
});

AttributeSelector.propTypes = {
  attribute: PropTypes.shape({
    meta: PropTypes.shape({
      tags: PropTypes.arrayOf(PropTypes.string),
      choices: PropTypes.arrayOf(PropTypes.string),
      writeable: PropTypes.bool,
    }),
    path: PropTypes.arrayOf(PropTypes.string),
    value: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({}),
    ]),
    pending: PropTypes.bool,
    errorState: PropTypes.bool,
    dirty: PropTypes.bool,
    alarm: PropTypes.shape({
      severity: PropTypes.number,
    }),
  }).isRequired,
  theme: PropTypes.shape({
    palette: PropTypes.shape({
      primary: PropTypes.shape({
        light: PropTypes.string,
      }),
      secondary: PropTypes.shape({
        main: PropTypes.string,
      }),
    }),
  }).isRequired,
  eventHandler: PropTypes.func.isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withTheme()(AttributeSelector)
);
