// /client/App.js
import React, { Component } from 'react';
import axios from 'axios';

class App extends Component {
    // 初始化组件的状态
    state = {
        data: [],
        id: 0,
        message: null,
        intervalIsSet: false,
        idToDelete: null,
        idToUpdate: null,
        objectToUpdate: null,
    };

    // 当组件加载时，它首先要从数据库中获取所有的数据，这里会设置一个轮询逻辑，及时将数据在 `UI` 中更新。
    componentDidMount() {
        this.getDataFromDb();
        if (!this.state.intervalIsSet) {
            let interval = setInterval(this.getDataFromDb, 5000);
            this.setState({ intervalIsSet: interval });
        }
    }

    // 永远不要让一个进程持续存在
    // 当我们结束使用时，一定要杀死这个进程
    componentWillUnmount() {
        if (this.state.intervalIsSet) {
            clearInterval(this.state.intervalIsSet);
            this.setState({ intervalIsSet: null });
        }
    }


    // 我们的第一个使用后端api的get方法
    // 从我们的数据库中获取数据
    getDataFromDb = () => {
        fetch('http://localhost:3001/api/getData')
            .then((data) => data.json())
            .then((res) => this.setState({ data: res.data }));
    };

    // 使用 put 方法，在数据库里面插入一条新的数据
    putDataToDB = (message) => {
        let currentIds = this.state.data.map((data) => data.id);
        let idToBeAdded = 0;
        while (currentIds.includes(idToBeAdded)) {
            ++idToBeAdded;
        }

        axios.post('http://localhost:3001/api/putData', {
            id: idToBeAdded,
            message: message,
        });
    };

    // 我们的删除方法使用我们的后端api
    // 删除现有数据库信息
    deleteFromDB = (idTodelete) => {
        parseInt(idTodelete);
        let objIdToDelete = null;
        this.state.data.forEach((dat) => {
            if (dat.id === idTodelete) {
                objIdToDelete = dat._id;
            }
        });

        axios.delete('http://localhost:3001/api/deleteData', {
            data: {
                id: objIdToDelete,
            },
        });
    };

    // 我们的更新方法使用我们的后端api
    // 覆盖现有的数据库信息
    updateDB = (idToUpdate, updateToApply) => {
        let objIdToUpdate = null;
        parseInt(idToUpdate);
        this.state.data.forEach((dat) => {
            if (dat.id === idToUpdate) {
                objIdToUpdate = dat._id;
            }
        });

        axios.post('http://localhost:3001/api/updateData', {
            id: objIdToUpdate,
            update: { message: updateToApply },
        });
    };

    render() {
        const { data } = this.state;
        return (
            <div>
                <ul>
                    {data.length <= 0
                        ? 'NO DB ENTRIES YET'
                        : data.map((dat) => (
                            <li style={{ padding: '10px' }} key={data.message}>
                                <span style={{ color: 'gray' }}> id: </span> {dat.id} <br />
                                <span style={{ color: 'gray' }}> data: </span>
                                {dat.message}
                            </li>
                        ))}
                </ul>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        onChange={(e) => this.setState({ message: e.target.value })}
                        placeholder="add something in the database"
                        style={{ width: '200px' }}
                    />
                    <button onClick={() => this.putDataToDB(this.state.message)}>
                        ADD
                    </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ idToDelete: e.target.value })}
                        placeholder="put id of item to delete here"
                    />
                    <button onClick={() => this.deleteFromDB(this.state.idToDelete)}>
                        DELETE
                    </button>
                </div>
                <div style={{ padding: '10px' }}>
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ idToUpdate: e.target.value })}
                        placeholder="id of item to update here"
                    />
                    <input
                        type="text"
                        style={{ width: '200px' }}
                        onChange={(e) => this.setState({ updateToApply: e.target.value })}
                        placeholder="put new value of the item here"
                    />
                    <button
                        onClick={() =>
                            this.updateDB(this.state.idToUpdate, this.state.updateToApply)
                        }
                    >
                        UPDATE
                    </button>
                </div>
            </div>
        );
    }
}

export default App;