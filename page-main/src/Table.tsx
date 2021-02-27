import React from 'react';
import './Table.css';

type TableProps = {
    fields: { displayName: string }[],
    data: any[][],
    admin: boolean,
    limit: number,
    offset: number,
    pageCount: number,
    startQuery: () => void,
    createNewOne: () => void,
    limitChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    offsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void
};

export class Table extends React.Component<TableProps> {
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
                        <input type="number" min="0" value={this.props.limit} onChange={this.props.limitChange} className="input-limit-and-offset"/>
                        <button className="button-little-2">
                            <img className="img2" src="./refresh.png" alt="" />
                        </button>
                        <span>
                            条记录
                        </span>
                        <button className="button-little">
                            <img src="./first.png" alt="" />
                        </button>
                        <button className="button-little">
                            <img src="./previous.png" alt="" />
                        </button>
                        <span>
                            当前第
                        </span>
                        <input type="number" min="0" value={this.props.offset} onChange={this.props.offsetChange} className="input-limit-and-offset"/>
                        <button className="button-little-2">
                            <img className="img2" src="./go.png" alt="" />
                        </button>
                        <span>
                            页/共{this.props.pageCount}页
                        </span>
                        <button className="button-little">
                            <img src="./next.png" alt="" />
                        </button>
                        <button className="button-little">
                            <img src="./last.png" alt="" />
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