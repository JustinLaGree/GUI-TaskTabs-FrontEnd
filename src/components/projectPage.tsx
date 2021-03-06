import * as React from "react";
import styled from 'styled-components';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Alert from "react-bootstrap/Alert";
import Spinner from 'react-bootstrap/Spinner';

import { ProjectColumn } from "./projectColumn";
import { SubTaskColumn } from "./subTaskColumn";
import { Task } from "./taskType";
import { TaskView } from "./taskView";
import { HistoryButton } from "./historyButton";
import Breadcrumb from "react-bootstrap/Breadcrumb";
import { UserInfo } from "./userInfo";
import { UserHeaderHttpRequest } from "./userHeaderHttpRequest";
import { RetryableFetch } from "./retryableFetch";
import { HistoryTab } from "./historyTab";
import { StatTab } from "./statTab";
import { LoadingPage } from "./loadingPage";
import { string } from "prop-types";

const styles = {
	box: {
		paddingLeft: 0,
		paddingRight: 0,
		minWidth: 1300
	},
	loader: {
		width: 100,
		height: 100
	},
	button: {
		height: 20,
		fontSize: 16
	}
};

interface SpinnerStyle {
	paddingLeft: number;
	paddingTop: number;
	mindWidth: number;
};

const HistoryRow = styled.div`
    padding-left: 16px;
    padding-right: 16px;
`;

interface IUser {
	id: number;
	name: string;
}

const testOwner: IUser = { id: 0, name: "Super Steve" };

const testSharedWith: IUser[] = [
	{ id: 1, name: "Little Steve" },
	{ id: 2, name: "Tiny Steve" },
];

interface ProjectHistory {
	id: number,
	name: string,
	progress: number,
	childProgress: number[]
};

interface ProjectPageProps {
	projectID: number;
	theme: string;
	fontSize: number;
	userInfo: UserInfo;
	hideProjectPage: any;
	viewPage: string;
	showLoading: () => any;
	showHistoryTab: () => any;
	showStatTab: () => any;
	showTaskView: () => any;
}

// ProjectPage contains the entire application past the Google oauth. This should include the left and right sidebars
// task view, settings user info, etc.
export class ProjectPage extends React.Component<ProjectPageProps, { projectId: number, error: any, isLoaded: boolean, task: Task, head: number, history: ProjectHistory[], projectColumnKey: number }>{

	constructor(props: ProjectPageProps) {
		super(props);

		this.state = {
			error: null,
			isLoaded: false,
			task: null,
			head: undefined,
			history: [],
			projectColumnKey: 1,
			projectId: this.props.projectID,
		};
	}

	// This will attempt to fetch from the database a given number of times.
	// This is needed because if the head was recently inserted, the fetch will
	// likely return null as the database will not have caught up yet.
	makeProjectQuery = () => {
		const request = new UserHeaderHttpRequest(`/api/tasks/${this.props.projectID}`, this.props.userInfo);
		RetryableFetch.fetch_retry(request)
			.then(res => res.json())
			.then(
				async (result) => {
					if (result) {

						// add the project to the beginning of the history
						let taskHistoryNode: ProjectHistory;
						let childProgress: number[] = await this.retrieveChildProgress(result._id);

						taskHistoryNode = { id: result._id, name: result.title, progress: result.progress, childProgress: childProgress };
						// state should be treated as if it were immutable.
						// However, concat returns a new array.
						this.setState({
							isLoaded: true,
							task: result,
							head: result._id,
							history: this.state.history.concat([taskHistoryNode])
						});
					}
				},
				// Note: it's important to handle errors here
				// instead of a catch() block so that we don't swallow
				// exceptions from actual bugs in components.
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				}
			);
	}

	componentDidMount() {
		// This will attempt to the make the Project Query 5 times before giving up.
		this.makeProjectQuery();
	}


	// TODO
	// assignedTo should probably be a User, not a string. Fine for now with dummy data,
	// but should be replaced.
	public render() {

		const { error, isLoaded, task, head, history, projectColumnKey } = this.state;

		if (error) {
			return (
				<Alert variant="danger">
					<Alert.Heading>We've Experienced an Error</Alert.Heading>
					<p> We could not establish a connection with our database. We apologise for the inconvenience. Please try again later.</p>
				</Alert>
			);
		} else if (!isLoaded) {
			let style: SpinnerStyle = {
				mindWidth: 1300,
				paddingLeft: (window.innerWidth - 50) / 2,
				paddingTop: (window.innerHeight - 50) / 2,
			};
			if (this.props.theme === "light") {
				return (
					<Col xs="4" style={style}>
						<Spinner animation="border" variant="dark" style={styles.loader} />
					</Col>
				);
			} else {
				return (
					<Col xs="4" style={style}>
						<Spinner animation="border" variant="light" style={styles.loader} />
					</Col>
				);
			}
		} else {
			let historyComponent =
				<Breadcrumb>
					{history.map(node => {
						return (
							<HistoryButton key={node.id} id={node.id} name={node.name} changeHead={this.changeHeadFromHistory} currentHead={head}
								theme={this.props.theme} fontSize={this.props.fontSize} />
						);
					})}
				</Breadcrumb>;

			// prevent date from being invalid, else everythign crashes
			let deadline;
			if (!!task.deadline) {
				deadline = new Date(task.deadline);
			} else {
				deadline = null;
			}
			let pageView;
			if (this.props.viewPage === "taskView") {
				pageView = <TaskView
					taskID={head}
					changeHead={this.changeHeadFromDelete}
					parentId={task.parentId}
					projectId={this.state.projectId}
					name={task.title}
					completion={task.progress}
					description={task.description}
					dueDate={deadline}
					status={task.status}
					assignedTo={task.assignedTo}
					owner={testOwner}
					sharedUsers={testSharedWith}
					userInfo={this.props.userInfo}
					theme={this.props.theme}
					fontSize={this.props.fontSize}
					showHistoryTab={this.props.showHistoryTab}
					showStatTab={this.props.showStatTab}
					hideProjectPage={this.props.hideProjectPage}
					refreshPage={this.refreshPage}
				/>;
			} else if (this.props.viewPage === "historyTab") {
				pageView = <HistoryTab
					theme={this.props.theme}
					fontSize={this.props.fontSize}
					viewPage={this.props.viewPage}
					showStatTab={this.props.showStatTab}
					showTaskView={this.props.showTaskView}
					taskID={task._id}
					userInfo={this.props.userInfo}
				/>;
			} else if (this.props.viewPage === "statTab") {
				pageView = <StatTab
					theme={this.props.theme}
					fontSize={this.props.fontSize}
					viewPage={this.props.viewPage}
					showHistoryTab={this.props.showHistoryTab}
					showTaskView={this.props.showTaskView}
					projectId={this.state.projectId}
					task={task.title}
					userInfo={this.props.userInfo}
				/>;
			} else {
				pageView = <LoadingPage theme={this.props.theme} showTaskView={this.props.showTaskView} />;
			}

			return (
				<Container fluid style={styles.box}>
					<HistoryRow>{historyComponent}</HistoryRow>
					<Row noGutters={true}>
						<Col sm="3"><ProjectColumn key={projectColumnKey} head={head} changeHead={this.changeHeadFromProject} userInfo={this.props.userInfo} theme={this.props.theme} fontSize={this.props.fontSize} showLoading={this.props.showLoading} /></Col>
						<Col sm="6">
							{pageView}
						</Col>
						<Col sm="3"><SubTaskColumn head={head} changeHead={this.changeHeadFromTask} userInfo={this.props.userInfo} projectId={this.props.projectID} theme={this.props.theme} fontSize={this.props.fontSize} showLoading={this.props.showLoading} /></Col>
					</Row>
				</Container>
			);
		}
	}

	refreshPage = () => {
		this.refreshFetch();
	}

	private changeHeadFromHistory = (newHead: number) => {
		this.changeHead(newHead, false, true);
	}

	private changeHeadFromTask = (newHead: number) => {
		this.changeHead(newHead, false);
	}

	private changeHeadFromProject = (newHead: number) => {
		this.changeHead(newHead, true);
	}

	private changeHeadFromDelete = () => {
		let history = this.state.history;

		let deletedTaskHistory = history.pop();

		if (history.length > 0) {

			this.setState({
				head: history[history.length - 1].id,
			});
			const request = new UserHeaderHttpRequest(`/api/tasks/${history[history.length - 1].id}`, this.props.userInfo);
			RetryableFetch.fetch_retry(request)
				.then(res => res.json())
				.then((result) => {

					let newAverage;
					let currentAverage;

					// remove the progress of the deleted task from the parent history node
					let parentHistoryNode = history[history.length - 1];
					for (let j = 0; j < parentHistoryNode.childProgress.length; j++) {
						if (parentHistoryNode.childProgress[j] === deletedTaskHistory.progress) {
							history[history.length - 1].childProgress.splice(j, 1);
							break;
						}
					}

					deletedTaskHistory.progress
					for (let i = history.length - 1; i >= 0; i--) {
						currentAverage = history[i].progress;
						newAverage = 0;
						// build new average
						for (let j = 0; j < history[i].childProgress.length; j++) {
							newAverage += history[i].childProgress[j]
						}
						if (history[i].childProgress.length != 0) {
							newAverage = newAverage / history[i].childProgress.length;
						} else {
							newAverage = history[i].progress;
						}

						if (newAverage !== currentAverage) {
							// update history
							history[i].progress = newAverage;
							// insert new id into database
							this.updateProgress(history[i].id, newAverage);

							// replace
							if (i - 1 >= 0) {
								for (let j = 0; j < history[i - 1].childProgress.length; j++) {
									if (history[i - 1].childProgress[j] === currentAverage) {
										history[i - 1].childProgress[j] = newAverage;
										break;
									}
								}
							}
						}
					}

					let updatedProgressResult = result;
					updatedProgressResult.progress = history[history.length - 1].progress;
					this.setState({ projectColumnKey: this.state.projectColumnKey + 1 });
					this.setState({
						isLoaded: true,
						task: updatedProgressResult,
						history: history
					});

				});
		} else {
			console.error("tried to delete from a project head");
		}

	}

	// get the progress of all the children and return it as an array
	private retrieveChildProgress = async (id: number): Promise<number[]> => {

		let childProgress: number[] = [];
		//get subtask progress
		const request = new UserHeaderHttpRequest(`/api/subtasks/${id}`, this.props.userInfo);
		await RetryableFetch.fetch_retry(request)
			.then(res => res.json())
			.then(
				(result) => {
					for (let i = 0; i < result.length; i++) {
						childProgress.push(result[i].progress);
					}
				},
				(error) => {
					console.error("cannot retrieve child progress. " + error);
				}
			);

		return childProgress;
	}

	// refresh fetch, called after a save. The head does not change, but names might have,
	// so the data needs to be recollected.
	private refreshFetch = () => {
		let history = this.state.history;
		const request = new UserHeaderHttpRequest(`/api/tasks/${this.state.head}`, this.props.userInfo);
		RetryableFetch.fetch_retry(request)
			.then(res => res.json())
			.then(
				async (result) => {

					let oldHistory = history.pop();

					let childProgress: number[] = await this.retrieveChildProgress(this.state.head);

					let taskHistoryNode: ProjectHistory = { id: result._id, name: result.title, progress: result.progress, childProgress: childProgress };

					history.push(taskHistoryNode);

					// ensure the child progress in history is up to date
					// skips the last element
					for (let i = 0; i < history.length - 1; i++) {
						if (history[i].childProgress.length === 0) {
							childProgress = await this.retrieveChildProgress(history[i].id);
							history[i].childProgress = childProgress;
						}
					}

					// If the progress of the task changed since the last save
					if (oldHistory.progress !== taskHistoryNode.progress) {
						let newAverage;
						let currentAverage;
						for (let i = history.length - 1; i >= 0; i--) {
							newAverage = 0;
							if (i === history.length - 1) {
								currentAverage = oldHistory.progress;
							} else {
								currentAverage = history[i].progress;
							}

							// build new average
							for (let j = 0; j < history[i].childProgress.length; j++) {
								newAverage += history[i].childProgress[j]
							}
							if (history[i].childProgress.length != 0) {
								newAverage = newAverage / history[i].childProgress.length;
							} else {
								newAverage = history[i].progress;
							}

							if (newAverage !== currentAverage) {
								// update history
								history[i].progress = newAverage;
								// insert new id into database
								this.updateProgress(history[i].id, newAverage);

								// replace
								if (i - 1 >= 0) {
									for (let j = 0; j < history[i - 1].childProgress.length; j++) {
										if (history[i - 1].childProgress[j] === currentAverage) {
											history[i - 1].childProgress[j] = newAverage;
											break;
										}
									}
								}
							}
						}
					}
					// increment key to re-render projectColumn
					this.setState({ projectColumnKey: this.state.projectColumnKey + 1 });
					this.setState({
						isLoaded: true,
						task: result,
						history: history
					});

				},
				(error) => {
					this.setState({
						isLoaded: true,
						error
					});
				}
			);
	}

	private updateProgress = async (id: number, progress: number) => {

		const updatedTask = { progress: progress };
		//get subtask progress
		const request = new UserHeaderHttpRequest(`/api/tasks/${id}`, this.props.userInfo, { 'Content-Type': 'application/json' });
		await RetryableFetch.fetch_retry(request,
			{
				method: 'PUT',
				mode: 'cors',
				body: JSON.stringify(updatedTask)
			})
			.catch((error) => {
				console.error('Error:', error);
			});

	}

	private changeHead = (newHead: number, isProject: boolean, isNewHeadHistoryTail?: boolean) => {
		const previousHead = this.state.head;
		if (newHead !== previousHead) {

			this.setState(() => {
				return { head: newHead };
			})

			const request = new UserHeaderHttpRequest(`/api/tasks/${newHead}`, this.props.userInfo);
			RetryableFetch.fetch_retry(request)
				.then(res => res.json())
				.then(
					async (result) => {

						// Update History
						if (isProject) {
							let newHistory: ProjectHistory[] = [];

							// create new node
							let taskHistoryNode: ProjectHistory;
							let childProgress: number[] = await this.retrieveChildProgress(this.state.head);

							taskHistoryNode = { id: result._id, name: result.title, progress: result.progress, childProgress: childProgress };

							newHistory.push(taskHistoryNode);

							// set new task
							this.setState({
								projectId: newHead,
								isLoaded: true,
								task: result,
								history: newHistory
							});

						}
						// This deletes the history after the previous head, and adds the new head to the end of the list.
						// Reason being that if you have pre-existing history and you go back in history and click a task button that was
						// not in the history previous, the entire history after the previous head must be erased.
						else if (!isNewHeadHistoryTail) {
							let headDiscovered = false;
							let history = this.state.history;
							let isNewHeadInHistory = false;

							// Check if the history is still correct, even though a task button was clicked
							for (let i = 0; i < history.length; i++) {
								if (history[i].id == newHead) {
									isNewHeadInHistory = true;
								}
							}
							// If the task is not present in the current history
							if (!isNewHeadInHistory) {
								// destory the end of the history until the head is discovered
								while (!headDiscovered && history.length !== 0) {
									if (history[history.length - 1].id != previousHead) {
										history.pop();
									} else {
										headDiscovered = true;
									}
								}

								let taskHistoryNode: ProjectHistory;
								let childProgress: number[] = await this.retrieveChildProgress(this.state.head);

								taskHistoryNode = { id: result._id, name: result.title, progress: result.progress, childProgress: childProgress };

								let parentChildProgress: number[] = await this.retrieveChildProgress(history[history.length - 1].id);
								// check if the parent's child progress array is up to date.
								if (history[history.length - 1].childProgress.length !== parentChildProgress.length) {
									history[history.length - 1].childProgress.push(result.progress);
									let newAverage: number;
									let currentAverage: number;
									for (let i = history.length - 1; i >= 0; i--) {

										currentAverage = history[i].progress;
										newAverage = 0;
										for (let j = 0; j < history[i].childProgress.length; j++) {
											newAverage += history[i].childProgress[j];
										}
										newAverage = newAverage / history[i].childProgress.length;
										if (newAverage !== history[i].progress) {
											this.updateProgress(history[i].id, newAverage);
										}

										// make sure that we don't go out of the array bounds
										// and update the parent's progress to reflect new changes
										if (i - 1 >= 0) {
											for (let j = 0; j < history[i - 1].childProgress.length; j++) {
												if (history[i - 1].childProgress[j] === currentAverage) {
													history[i - 1].childProgress[j] = newAverage;
													break;
												}
											}
										}
									}
								}
								history.push(taskHistoryNode);
							}

							// increment key to re-render projectColumn
							this.setState({ projectColumnKey: this.state.projectColumnKey + 1 });
							this.setState({
								isLoaded: true,
								task: result,
								history: history
							});
						}
						// If the user clicked a history button, no history changes need to be made.
						else {
							this.setState({
								isLoaded: true,
								task: result,
							});
						}
					},
					// Note: it's important to handle errors here
					// instead of a catch() block so that we don't swallow
					// exceptions from actual bugs in components.
					(error) => {
						this.setState({
							isLoaded: true,
							error
						});
					}
				);
		}
	}
};
