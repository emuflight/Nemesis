import React, { Component } from "react";
import FCConnector from "../../utilities/FCConnector";
import { FormattedMessage } from "react-intl";
import Chip from "@material-ui/core/Chip";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";

export default class ArmingFlagsView extends Component {
  constructor(props) {
    super(props);
    let flags = [];
    if (props.rcCalibrated && props.rcCalibrated.current !== "1") {
      flags.push({
        id: "rc_calibrated",
        label: "calibration.rc"
      });
    }
    if (props.boardCalibrated && props.boardCalibrated.current !== "1") {
      flags.push({
        id: "board_calibrated",
        label: "calibration.board"
      });
    }
    if (props.imufVersion === "9999") {
      flags.push({
        id: "imuf_update",
        label: "imuf.needs-update"
      });
    }
    this.staticFlags = flags;

    this.state = {
      armingFlags: this.staticFlags
    };
  }
  handleStatusMessage = message => {
    try {
      let { armingFlags, type } = JSON.parse(message.data);
      if (type === "status") {
        //rotate the model on the Y axis so it's oriented correctly

        this.setState({
          armingFlags: this.staticFlags.concat(
            armingFlagsList.filter(flag => armingFlags & flag.mask)
          )
        });
      }
    } catch (ex) {
      console.warn("unable to parse telemetry", ex);
    }
  };

  componentDidMount() {
    FCConnector.webSockets.addEventListener(
      "message",
      this.handleStatusMessage
    );
  }

  componentWillUnmount() {
    FCConnector.webSockets.removeEventListener(
      "message",
      this.handleStatusMessage
    );
  }

  render() {
    return (
      <React.Fragment>
        <Typography variant="h5">
          <FormattedMessage id="pfc.armingflags.title" />
        </Typography>
        <List>
          {this.state.armingFlags.map(flag => (
            <Chip
              key={flag.label}
              style={{ margin: 4 }}
              label={<FormattedMessage id={flag.label} />}
            />
          ))}
        </List>
      </React.Fragment>
    );
  }
}

const armingFlagsList = [
  {
    mask: 1 << 0,
    label: "NO_GYRO"
  },
  {
    mask: 1 << 1,
    label: "FAILSAFE"
  },
  {
    mask: 1 << 2,
    label: "RX_FAILSAFE"
  },
  {
    mask: 1 << 3,
    label: "BAD_RX_RECOVERY"
  },
  {
    mask: 1 << 4,
    label: "BOXFAILSAFE"
  },
  {
    mask: 1 << 5,
    label: "ANTITAZ"
  },
  {
    mask: 1 << 6,
    label: "THROTTLEUP"
  },
  {
    mask: 1 << 7,
    label: "SMALLANGLE"
  },
  {
    mask: 1 << 8,
    label: "BOOT_GRACE_TIME"
  },
  {
    mask: 1 << 9,
    label: "NOPREARM"
  },
  {
    mask: 1 << 10,
    label: "LOAD"
  },
  {
    mask: 1 << 11,
    label: "CALIBRATING"
  },
  {
    mask: 1 << 12,
    label: "CLI"
  },
  {
    mask: 1 << 13,
    label: "CMS_MENU"
  },
  {
    mask: 1 << 14,
    label: "OSD_MENU"
  },
  {
    mask: 1 << 15,
    label: "BST"
  },
  {
    mask: 1 << 16,
    label: "MSP"
  },
  {
    mask: 1 << 17,
    label: "PARALYZE"
  },
  {
    mask: 1 << 18,
    label: "GPS"
  },
  {
    mask: 1 << 19,
    label: "ARM_SWITCH"
  }
];
