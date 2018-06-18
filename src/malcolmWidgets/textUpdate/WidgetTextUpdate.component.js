import * as React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { emphasize } from '@material-ui/core/styles/colorManipulator';

const styles = theme => ({
  div: {
    display: 'flex',
    alignItems: 'center',
  },
  textUpdate80: {
    backgroundColor: emphasize(theme.palette.background.paper, 0.1),
    padding: 4,
    paddingRight: 9,
    textAlign: 'Right',
    width: '80%',
  },
  textUpdate100: {
    backgroundColor: emphasize(theme.palette.background.paper, 0.1),
    padding: 4,
    paddingRight: 16,
    textAlign: 'Right',
    width: '100%',
  },
  unitBox: {
    backgroundColor: emphasize(theme.palette.background.paper, 0.1),
    color: emphasize(theme.palette.primary.contrastText, 0.2),
    padding: 4,
    paddingRight: 2,
    width: '20%',
  },
});

const WidgetTextUpdate = props => {
  if (!props.Units) {
    return (
      <div className={props.classes.div}>
        <Typography className={props.classes.textUpdate100} noWrap>
          {props.Text}
        </Typography>
      </div>
    );
  }
  return (
    <div className={props.classes.div}>
      <Typography className={props.classes.textUpdate80} noWrap>
        {props.Text}
      </Typography>
      <Typography className={props.classes.unitBox} noWrap>
        {props.Units}
      </Typography>
    </div>
  );
};

WidgetTextUpdate.propTypes = {
  Text: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  Units: PropTypes.string,
  classes: PropTypes.shape({
    textUpdate100: PropTypes.string,
    textUpdate80: PropTypes.string,
    unitBox: PropTypes.string,
    div: PropTypes.string,
  }).isRequired,
};

WidgetTextUpdate.defaultProps = {
  Units: null,
};

export default withStyles(styles, { withTheme: true })(WidgetTextUpdate);