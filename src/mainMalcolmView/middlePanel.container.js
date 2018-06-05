import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { connect } from 'react-redux';
import Layout from '../layout/layout.component';

const styles = () => ({
  container: {
    marginTop: 64,
    height: '100%',
    width: '100%',
  },
  layoutArea: {
    display: 'flex',
    width: '100%',
    height: 'calc(100vh - 64px)',
    backgroundColor: 'rgb(48, 48, 48)',
    backgroundImage:
      'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.05) 75%, rgba(255, 255, 255, 0.05) 76%, transparent 77%, transparent)',
    backgroundSize: '50px 50px',
  },
});

const findAttributeComponent = props => {
  if (props.mainAttribute === 'layout') {
    return (
      <div className={props.classes.layoutArea}>
        <Layout blocks={props.layout.blocks} />
      </div>
    );
  }

  return null;
};

const MiddlePanelContainer = props => (
  <div className={props.classes.container}>{findAttributeComponent(props)}</div>
);

const mapStateToProps = state => ({
  mainAttribute: state.malcolm.mainAttribute,
  layout: state.malcolm.layout,
});

const mapDispatchToProps = () => ({});

findAttributeComponent.propTypes = {
  mainAttribute: PropTypes.string.isRequired,
  classes: PropTypes.shape({
    layoutArea: PropTypes.string,
  }).isRequired,
  layout: PropTypes.shape({
    blocks: PropTypes.arrayOf(PropTypes.shape({})),
  }),
};

findAttributeComponent.defaultProps = {
  layout: {
    blocks: [],
  },
};

MiddlePanelContainer.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
  }).isRequired,
};

export default connect(mapStateToProps, mapDispatchToProps)(
  withStyles(styles)(MiddlePanelContainer)
);
