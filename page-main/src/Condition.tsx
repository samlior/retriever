import React from 'react';
import './Condition.css';

type ConditionProps = {
    displayName: string
    valueChange: (type: string, value: string) => void
}

export class NumberCondition extends React.Component<ConditionProps>{
    render() {
        const handleValueChange = (type: string, event: React.ChangeEvent<HTMLInputElement>) => {
            this.props.valueChange(type, event.target.value)
        }
        return (
            <div className="div-condition-main">
                <span className="span-condition-display-name">{this.props.displayName}:</span>
                <div className="div-condition-colunm-wrapper">
                    <div className="div-condition-colunm">
                        <div className="div-condition-span-wrapper">
                            <span className="span-condition-line">小于: </span>
                        </div>
                        <div className="div-condition-span-wrapper">
                            <span className="span-condition-line">小于等于: </span>
                        </div>
                        <div className="div-condition-span-wrapper">
                            <span className="span-condition-line">等于: </span>
                        </div>
                        <div className="div-condition-span-wrapper">
                            <span className="span-condition-line">大于等于: </span>
                        </div>
                        <div className="div-condition-span-wrapper">
                            <span className="span-condition-line">大于: </span>
                        </div>
                    </div>
                    <div className="div-condition-colunm-2">
                        <div className="div-condition-input-wrapper">
                            <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'lt')}/>
                            <button className="button-condition-clear">清空</button>
                        </div>
                        <div className="div-condition-input-wrapper">
                            <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'lte')}/>
                            <button className="button-condition-clear">清空</button>
                        </div>
                        <div className="div-condition-input-wrapper">
                            <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'eq')}/>
                            <button className="button-condition-clear">清空</button>
                        </div>
                        <div className="div-condition-input-wrapper">
                            <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'gte')}/>
                            <button className="button-condition-clear">清空</button>
                        </div>
                        <div className="div-condition-input-wrapper">
                            <input type="number" min="0" className="input-condition" onChange={handleValueChange.bind(this, 'gt')}/>
                            <button className="button-condition-clear">清空</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}