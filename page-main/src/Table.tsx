import React from 'react';
import './Table.css';

type TableProps = {
    fields: { displayName: string }[],
    data: any[][],
    admin: boolean,
    limit: number,
    offset: number,
    pageCount: number,
    startQuery: (newOffset?: number) => void,
    createNewOne: () => void,
    limitChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    offsetChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
    updateRecord: (data: any[]) => void,
    deleteRecord: (id: number) => void
};

export class Table extends React.Component<TableProps> {
    render() {
        return (
            <div>
                <div className="div-table-header">
                    <div className="div-table-header-front">
                        <button className="button-start-query" onClick={() => { this.props.startQuery() }}>
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
                        <button className="button-little-2" onClick={() => { this.props.startQuery() }}>
                            <img className="img2" src="./refresh.png" alt="" />
                        </button>
                        <span>
                            条记录; 
                        </span>
                        <button className="button-little" onClick={() => { this.props.startQuery(0) }}>
                            <img src="./first.png" alt="" />
                        </button>
                        <button className="button-little" onClick={() => { this.props.startQuery(this.props.offset - 1 >= 0 ? this.props.offset - 1 : 0) }}>
                            <img src="./previous.png" alt="" />
                        </button>
                        <span>
                            当前第
                        </span>
                        <input type="number" min="0" value={this.props.offset + 1} onChange={this.props.offsetChange} className="input-limit-and-offset"/>
                        <button className="button-little-2" onClick={() => { this.props.startQuery() }}>
                            <img className="img2" src="./go.png" alt="" />
                        </button>
                        <span>
                            页/共{this.props.pageCount + 1}页
                        </span>
                        <button className="button-little" onClick={() => { this.props.startQuery(this.props.offset + 1) }}>
                            <img src="./next.png" alt="" />
                        </button>
                        <button className="button-little" onClick={() => { this.props.startQuery(this.props.pageCount) }}>
                            <img src="./last.png" alt="" />
                        </button>
                    </div>
                </div>
                <div className="div-table-wrapper">
                    <table>
                        <tr>
                            {(() => {
                                const fields = this.props.fields.map((f) => <th>{f.displayName}</th>)
                                if (this.props.admin) {
                                    fields.push(<th>操作</th>)
                                }
                                return fields
                            })()}
                        </tr>
                        {this.props.data.map((row) => {
                            const rows = row.map((ele) => <td>{ele}</td>)
                            if (this.props.admin) {
                                rows.push(<td>
                                    <div className="div-table-operator">
                                        <button className="button-operator-left" onClick={() => { this.props.updateRecord(row.map((d) => d === '-' ? '' : d)) }}>改</button>
                                        <button className="button-operator-right" onClick={() => { this.props.deleteRecord(typeof row[0] === 'number' ? row[0] : Number(row[0])) }}>删</button>
                                    </div>
                                </td>)
                            }
                            return <tr>{rows}</tr>
                        })}
                    </table>
                </div>
            </div>
        )
    }
}