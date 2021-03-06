import * as React from 'react';

import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

const light = {
    font16: {
        fontSize: 12
    },
    font24: {
        fontSize: 20
    },
    font32: {
        fontSize: 28
    },
    font40: {
        fontSize: 36
    }
};

const dark = {
    font16: {
        fontSize: 12,
        backgroundColor: "#343a40",
        color: "#f8f9e8"
    },
    font24: {
        fontSize: 20,
        backgroundColor: "#343a40",
        color: "#f8f9e8"
    },
    font32: {
        fontSize: 28,
        backgroundColor: "#343a40",
        color: "#f8f9e8"
    },
    font40: {
        fontSize: 36,
        backgroundColor: "#343a40",
        color: "#f8f9e8"
    },
    label16: {
        fontSize: 12,
        backgroundColor: "#232931",
        color: "#f8f9e8"
    },
    label24: {
        fontSize: 20,
        backgroundColor: "#232931",
        color: "#f8f9e8"
    },
    label32: {
        fontSize: 28,
        backgroundColor: "#232931",
        color: "#f8f9e8"
    },
    label40: {
        fontSize: 36,
        backgroundColor: "#232931",
        color: "#f8f9e8"
    }
};


interface Options {
    id: number;
    value: string;
    label: string;
}

// Needed in order to do anything with changing the state
interface StatusState {
    taskStatus: any
}

interface StatusDropdownProps {
    taskStatus: string;
    statusList: Options[];
    handleChange: any;
    theme: string;
    fontSize: number;
}

export class StatusDropdown extends React.Component<StatusDropdownProps, StatusState> {
    options: Options[];

    constructor(props: StatusDropdownProps) {
        super(props);
        this.state = {
            taskStatus: props.taskStatus
         }
        this.options = props.statusList;
    }

    componentDidUpdate(oldProps: StatusDropdownProps) {
        const { taskStatus } = this.props;
        if (oldProps.taskStatus !== taskStatus) {
            this.setState({
                taskStatus: taskStatus
            })
        }
    }

    render() {
        const taskStatus = this.state.taskStatus;
        // Maps through the array given and sets up the options
        const arrayOp = this.options.map((item) => {
            return (
                <option key={item.id} value={item.value}>{item.label}</option>
            )
        });

        let style;
        if(this.props.theme === "light"){
            if(this.props.fontSize === 16){
                style = light.font16;
            } else if(this.props.fontSize === 24) {
                style = light.font24;
            } else if(this.props.fontSize === 32) {
                style = light.font32;
            } else {
                style = light.font40;
            }
        } else {
            if(this.props.fontSize === 16){
                style = dark.font16;
            } else if(this.props.fontSize === 24) {
                style = dark.font24;
            } else if(this.props.fontSize === 32) {
                style = dark.font32;
            } else {
                style = dark.font40;
            }
        }

        return (
            <Form style={style}>
                <Form.Group as={Row} controlId="statusDropdown">
                    <Form.Label column sm="4">Status:</Form.Label>
                    <Col sm="8">
                        <Form.Control
                            as="select"
                            onChange={(event: any) => {
                                this.setState({taskStatus: event.target.value});
                                this.props.handleChange(event);
                            }}
                            value={taskStatus}
                            size="lg"
                            style={style}
                        >
                            {arrayOp}
                        </Form.Control>
                    </Col>
                </Form.Group>
            </Form>
        );
    }
}
