import * as React from 'react';
import styled from 'styled-components';

const Tags = styled.div`
    text-align: center;
    margin: 10px;
`;

const LabelText = styled.label`
    font-size: 32px;
`;

// Have a visual signifier that a user could remove a tag if they wanted to
// when they click on it
const TagButton = styled.button`
    border: none;
    margin: 5px;
    :hover {
        cursor: pointer;
        text-decoration: line-through;
    }
`;

const ButtonText = styled.div`
    font-size: 32px;
`;

const AddTagButton = styled.button`
    border-radius: 100%;
    width: 50px;
    height: 50px;
`;

interface Tag {
    tag: string;
    id: number;
}

interface TaskTagsProps {
    tags: Tag[];
}

export class TaskTags extends React.Component<TaskTagsProps> {
    tags: Tag[];

    constructor(props: TaskTagsProps) {
        super(props);

        this.tags = props.tags;
    }

    render() {
        const tagArray = this.tags.map((item , i) =>
        {
            return (
                <TagButton key={item.id}> <ButtonText> {item.tag} </ButtonText> </TagButton>
            )
        });

        return(
            <Tags>
                <LabelText> Tags: </LabelText>
                {tagArray}
                <AddTagButton><ButtonText>+</ButtonText></AddTagButton>
            </Tags>
        )
    }
}
