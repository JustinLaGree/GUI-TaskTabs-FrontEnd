import * as React from "react";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import ApplicationConfig from './applicationConfig';

const styles = {
    button: {
        width: window.innerWidth,
        height: 100,
        fontSize: 32
    }
};

interface NewTaskPost {
    owner: string,
    parentId: number,
    title: string,
    description: string,
    notes: string,
    assignedTo: number,
    status: string,
    progress: number
}

interface NewSubTaskButtonProps {
    head: number,
    changeHead: (newHead: number) => any;
}

export class NewSubTaskButton extends React.Component<NewSubTaskButtonProps> {

    constructor(props: NewSubTaskButtonProps) {
        super(props);

    }

    createNewSubTask = () => {

        // TODO 
        // should be user from google oauth
        const newSubTask:NewTaskPost = {owner: "littlebobbytables@xkcd.com", parentId: this.props.head, title:"New task", description:"", notes:"", assignedTo: null, status:"Active", progress:0};
        fetch(`${ApplicationConfig.api.staging.baseUrl}/api/tasks`,
        {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
              },
            body: JSON.stringify(newSubTask)
        }).then((response) => response.json())
            .then((data) => {
                // This will refresh the page with the new task as the current head.
                this.props.changeHead(data._id);
          })
          .catch((error) => {
            console.error('Error:', error);
          });
    }

    public render() {
        return (
            <Container fluid>
                <Row>
                    <Button style={styles.button} size="lg" variant="outline-primary" onClick={this.createNewSubTask}> + New Task </Button>
                </Row>
            </Container>
        );
    }
}