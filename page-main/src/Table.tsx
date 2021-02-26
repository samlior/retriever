import React from 'react';
import './Table.css';

type TableProps = {
    fields: { displayName: string }[],
    data: any[][],
    admin: boolean,
    limit: number,
    offset: number,
    startQuery: () => void,
    createNewOne: () => void
};

export class Table extends React.Component<TableProps> {
    constructor(props: TableProps) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="div-table-header">
                    <div className="div-table-header-front">
                        <button className="button-start-query" onClick={this.props.startQuery}>
                            开始搜索
                        </button>
                        {!this.props.admin ? undefined :
                            <button className="button-create-new-one" onClick={this.props.createNewOne}>
                                新增记录
                            </button>}
                    </div>
                    <div className="div-table-header-tail">
                        <span>
                            每页显示
                        </span>
                        <input type="number" min="0" className="input-limit-and-offset"/>
                        <button className="button-little">
                            <img src="./first.png" />
                        </button>
                        <button className="button-little">
                            <img src="./previous.png" />
                        </button>
                    </div>
                </div>
                <div className="div-table-wrapper">
                    <table>
                        <tr>
                            {this.props.fields.map((f) => <th>{f.displayName}</th>)}
                        </tr>
                        {this.props.data.map((row) => <tr>{row.map((ele) => <td>{ele}</td>)}</tr>)}
                    </table>
                </div>
            </div>
        )
    }
}