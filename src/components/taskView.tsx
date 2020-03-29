import * as React from 'react';
import styled from 'styled-components';

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { TaskProgressBar } from './progressBar';
import { StatusDropdown } from './statusDropdown';
import { AssignedDropdown } from './assignedDropdown';
import { TaskTags } from './taskTags';
import { ShareUsers } from './shareUsers';

interface ColumnProps {
    height: number;
};

// The column will remain at its maximum height, so if the window
// is shrunk , a scrollbar will remain unless the height of the column
// is changed to the window height
const Column = styled.div`
    display: flex;
    flex-direction: column;
    height: ${(props: ColumnProps) => props.height}px;
`;

interface ContainerProps {
    height: number;
    width: number;
};

const Container = styled.div`
    border-width: 5px;
    border-style: solid;
    padding: 50px;
    height: ${(props: ContainerProps) => props.height}px;
    width: ${(props: ContainerProps) => props.width}px;
`;

const Title = styled.div`
    font-size: 72px;
    margin-left: 50px;
    margin-top: 10px;
`;

const SaveButton = styled.button`
    width: 177px;
    height: 100px;
`;

const SaveButtonText = styled.div`
    font-size: 32px;
    margin: 30px;
`;

// The delete button is absolutely positioned to the right because the length of the
// title could influence the button's position.
const DeleteButton = styled.button`
    width: 177px;
    height: 40px;
    position: absolute;
    top: 60px;
    right: 30px;
`;

const DeleteButtonText = styled.div`
    font-size: 32px;
`;

const LabelText = styled.div`
    font-size: 32px;
    text-align: center;
    margin-bottom: 10px;
`;

const DueDates = styled.div`
    font-size: 32px;
    text-align: center;
    margin-bottom: 10px;
	margin-left: 30%;
	margin-right: auto;
`;

const CalendarButton = styled.button`
    width: 180px;
    height: 50px;
    margin: 5px;
`;

// In order to format the description on the page properly, needed to create a seperate div for it
const DescBox = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
    left: 175px;
    margin-top: 10px;
`;

const DescText = styled.textarea`
    font-size: 32px;
    margin: auto;
    margin-left: 10px;
    max-width: 600px;
    max-height: 150px;
`;

const HistoryButton = styled.button`
    width: 207px;
    height: 125px;
    bottom: 3px;
    right: 408px;
`;

const Row = styled.div`
    display: flex;
    flex-direction: row;
    position: relative;
`;

interface Options {
    id: number;
    value: string;
    label: string;
};

interface User {
    id: number;
    name: string;
};

interface Tag {
    tag: string;
    id: number;
}

interface TaskViewProps {
    name: string;
    completion: number;
    description: string;
    dueDate: Date;
    startDate: Date;
    status: string;
    assignee: string;
    tags: Tag[];
    owner: User;
    sharedUsers: User[];
};

// TaskView is intended to be the center view for all tasks, substasks and project heads.
export class TaskView extends React.Component<TaskViewProps>{
    name: string;
    displayedName: string;
    displayedDueDate: string;
    today: Date;
    daysLeft: number;
    displayedDaysLeft: string;
    displayedStartDate: string;
    status: string;
    statusOptions: Options[];
    assignedOptions: Options[];
    tags: Tag[];
    owner: User;
    sharedUsers: User[];
	
	state = {width: 0, height: 0, dueDate: this.props.dueDate};
	

    constructor(props: TaskViewProps) {
        super(props);
        this.displayedName = this.name;

        this.today = new Date();
        this.daysLeft = 0;
        this.displayedDaysLeft = "0 Days Left!";
        this.displayedDueDate = "1/1/1900";
        this.displayedStartDate = "1/1/1900";

        this.status = props.status;
        this.statusOptions = [
            { id: 0, value: 'active', label: 'Active' },
            { id: 1, value: 'inactive', label: 'Inactive' },
            { id: 2, value: 'complete', label: 'Complete' },
        ];

        this.owner = props.owner;
        this.sharedUsers = props.sharedUsers;

        this.tags = props.tags;

        this.state = { width: 0, height: 0, dueDate: this.props.dueDate};
    }
	
	handleChange = (date: Date) => {
		this.setState({
			dueDate: date
		});
		this.calculateDaysLeft();
	};
  
    // If the title is too long, we should shorten it to fit the space we have.
    displayName = () => {
        let displayedName = this.props.name;
        if (displayedName.length > 16) {
            displayedName = displayedName.substring(0, 15);
            displayedName += "...";
        }
        return displayedName;
    }

    // Calculates the difference between the current date and the due date
    calculateDaysLeft = () => {
        if (this.today !== this.state.dueDate) {
            const dueMonth = this.state.dueDate.getMonth() + 1;
            const dueYear = this.state.dueDate.getFullYear();
            const dueDay = this.state.dueDate.getDate();
            const todayMonth = this.today.getMonth() + 1;
            const todayYear = this.today.getFullYear();
            const todayDay = this.today.getDate();
            const divide = 1000 * 60 * 60 * 24;

            this.daysLeft = Math.floor((Date.UTC(dueYear, dueMonth, dueDay) - Date.UTC(todayYear, todayMonth, todayDay)) / divide);
        }
    }

    // Takes the due date and turns it into a string
    dueDateString = () => {
        const dueMonth = this.props.dueDate.getMonth() + 1;
        const dueYear = this.props.dueDate.getFullYear();
        const dueDay = this.props.dueDate.getDate();

        this.displayedDueDate = dueMonth + "/" + dueDay + "/" + dueYear;

    }

    // Takes the start date and turns it into a string
    startDateString = () => {
        const month = this.props.startDate.getMonth() + 1;
        const year = this.props.startDate.getFullYear();
        const day = this.props.startDate.getDate();

        this.displayedStartDate = month + "/" + day + "/" + year;
    }

    // Checks how many days are left and changes message accordingly
    daysLeftCheck = () => {
        if(this.daysLeft >= 0) {
            if(this.daysLeft === 1) {
                this.displayedDaysLeft = this.daysLeft + " Day Left!";
            }
            else {
                this.displayedDaysLeft = this.daysLeft + " Days Left!";
            }
        }
        else {
            if(this.daysLeft === -1) {
                this.displayedDaysLeft = Math.abs(this.daysLeft) + " Day Late!";
            }
            else {
                this.displayedDaysLeft = Math.abs(this.daysLeft) + " Days Late!";
            }
        }
    }

    updateDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    };

    // When this object is displayed, add an event that check for window resizes.
    componentDidMount() {
        window.addEventListener('resize', this.updateDimensions);
    }

    // Remove event when the object is unmounted.
    componentWillUnmount() {
        window.removeEventListener('resize', this.updateDimensions);
    }

    // Return the height the taskView Container should display at.
    // Prevents the taskView from getting too small.
    checkHeight = () => {
        const shareUsersHeight = 208;
        const height = window.innerHeight - shareUsersHeight;
        return height > 620 ? height : 620;
    }

    // Return the width the taskView Container should display at.
    // Prevents the taskView from getting too small.
    checkWidth = () => {
        const totalSidebarWidth = 930;
        const width = window.innerWidth - totalSidebarWidth;
        return width > 920 ? width : 920;
    }

    // TODO
    // When the database is integrated, we need to implement the onChange here so that
    // the new text is saved in some way and inserted into the database.
    // <DescText value={description} onChange={e => null} />
    render() {
        this.calculateDaysLeft();
        this.dueDateString();
        this.startDateString();
        this.daysLeftCheck();
        const name = this.displayName();
        const height = this.checkHeight();
        const width = this.checkWidth();
        const description = this.props.description;
        return (
            <Column height={window.innerHeight}>
                <Container height={height} width={width}>
                    <Row>
                        <SaveButton>
                            <SaveButtonText>Save</SaveButtonText>
                        </SaveButton>
                        <Title>{name}</Title>
                        <DeleteButton>
                            <DeleteButtonText>Delete</DeleteButtonText>
                        </DeleteButton>
                    </Row>
                    <TaskProgressBar percentage={this.props.completion} />
                    <DueDates>
					<Row>Due Date:
							<DatePicker
								selected={this.state.dueDate}
								onChange={this.handleChange}
							/>
						</Row>
                    </DueDates>
                    <LabelText> {this.displayedDaysLeft} </LabelText>
                    <Row>
                        <StatusDropdown taskStatus={this.status} statusList={this.statusOptions} />
                        <AssignedDropdown assignedState={this.props.assignee} sharedUsers={this.sharedUsers} owner={this.owner} />
                    </Row>
                    <LabelText> Date Started: {this.displayedStartDate} </LabelText>
                    <LabelText> Average Time Per Task: N/A Days </LabelText>
                    <Row>
                        <DescBox>
                            <LabelText> Description: </LabelText>
                            <DescText value={description} onChange={e => null} />
                        </DescBox>
                    </Row>
                    <TaskTags tags={this.tags} />

                </Container>
                <Row>
                    <ShareUsers owner={this.owner} sharedUsers={this.sharedUsers} />
                    <HistoryButton>
                        <LabelText>
                            History
                    </LabelText>
                    </HistoryButton>
                </Row>
            </Column>
        );
    }
};
