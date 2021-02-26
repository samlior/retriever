import React from 'react';
import './Table.css';

type TableProps = {
    fields: { displayName: string }[],
    data: any[][],
    startQuery: () => void
};

export class Table extends React.Component<TableProps> {
    constructor(props: TableProps) {
        super(props);
    }

    render() {
        return (
            <div>
                <div className="div-table-header">
                    <button className="button-start-query" onClick={this.props.startQuery}>
                        开始搜索
                    </button>
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