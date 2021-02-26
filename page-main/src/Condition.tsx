import React from 'react';
import './Condition.css';

type ConditionProps = {
    addCondition: () => void,
    valueChange: (type: string, value: string) => void
}

export class Condition extends React.Component<ConditionProps>{
    constructor(props: any) {
        super(props)
    }

    render() {
        const handleValueChange = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
            this.props.valueChange(type, event.target.value)
        }
        return (
            <div className="div-condition-main">
                <h1>Condition:</h1>
                <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'value1')}/>
            </div>
        )
    }
}