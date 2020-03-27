import * as React from 'react';
import styled from 'styled-components';

import { SubTaskButton } from './subTaskButton';
import { SubTask } from './subtaskType';
import { Button } from 'react-bootstrap';

interface ColumnProps {
    height: number;
};

const Column = styled.div`
  display: flex;
  flex-direction: column;
  border-width: 5px 5px 5px 0px;
  border-style: solid;
  height: ${(props: ColumnProps) => props.height}px;
`;

const NewTaskButton = styled.button`
    height: 100px;
    width: 400px;
    :hover {
        cursor: pointer;
    }
`;

interface SubTaskColumnProps {
    subtasks: SubTask[];
    changeHead: (newHead: SubTask) => any;
}

// This creates the entire right-hand column of project page. It handles the button that creates a new task,
// and hands down a single element of a subtask array to create subtask buttons one by one.
export class SubTaskColumn extends React.Component<SubTaskColumnProps>{

    constructor(props: SubTaskColumnProps) {
        super(props);

        this.state = { height: 0 };
    }

    updateDimensions = () => {
        this.setState({ height: window.innerHeight });
    };

    // When this object is displayed, add an event that check for window resizes.
    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    // Remove event when the object is unmounted.
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    // Make sure column doesn't get too small
    checkHeight = () => {
        const height = window.innerHeight;
        return height > 825 ? height : 825;
    }

    render() {
        const height = this.checkHeight();
        return (
            <Column height = {height}>
                <Button>+ New Task</Button>
                {this.props.subtasks.map((task) => {
                    return <SubTaskButton name={task.name} percentage={task.percentage} key={task.id} changeHead={this.props.changeHead} taskHead={task}></SubTaskButton>;
                })}
            </Column>
        );
    }
};