import React, { useState } from 'react';
import Layout from '../common/Layout';
import styles from './index.module.scss';
import cn from 'classnames/bind';
import {
    Avatar,
    Modal,
    Button,
    Form, Input,
    message,
    Upload,
    Tooltip
} from 'antd';
import {
    TeamOutlined,
    EnvironmentOutlined,
    EditOutlined,
    PlusCircleOutlined,
    PlusOutlined,
    LoadingOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import MyProfile from './MyProfile/MyProfile';
import MyPost from './MyPost';
import MyAnswer from './MyAnswer';
import FavoritePost from './FavoritePost';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import { changeUserInfo } from '../../features/user/userSlice';
import UploadAvatar from './UploadAvatar/UploadAvatar';

const cx = cn.bind(styles);

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const { TextArea } = Input;

const link = [
    {
        title: 'Profile',
        path: '',
        tab: 1,
    },
    {
        title: 'My posts',
        path: 'my-post',
        tab: 2,
    },
    {
        title: 'My answers',
        path: 'my-answer',
        tab: 3,
    },
    {
        title: 'Favorite posts',
        path: 'favorite-post',
        tab: 4,
    }
]

const Profile = () => {
    const dispatch = useDispatch();
    const [tabActive, setTabActive] = useState(1);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isPasswordModal, setIsPasswordModal] = useState(false);
    const userInfo = useSelector(state => state.user.info);
    const [uploading, setUploading] = useState();
    const [fileList, setFileList] = useState([]);
    const [visibleModalUploadAvatar, setVisibleModalUploadAvatar] = useState();

    const handleOk = () => {
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

    const onFinish = async (values) => {
        const token = window.localStorage.getItem("accessTokenSO");
        // const config = {
        //     headers: { 'x-access-token': `Bearer ${token}` }
        // };

        const bodyParams = {
            'token': token,
            'userName': values.username ? values.username : userInfo.userName,
            'gender': true,
            'facebookLink': values.facebookLink ? values.facebookLink : userInfo.facebookLink,
            'githubLink': values.githubLink ? values.githubLink : userInfo.githubLink,
            'location': values.location ? values.location : userInfo.location,
            'description': values.description ? values.description : userInfo.description,
        }
        try {
            const res = await axios.post(
                "http://localhost:3001/user/edit-profile",
                bodyParams
            );

            if (res.status === 200) {
                console.log(res);
                dispatch(changeUserInfo(res.data.user));
                message.success("Change profile success!");
                setIsModalVisible(false);
            }

        } catch (err) {
            console.log(err.response);
            message.error(err.response?.data?.message);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const onFinishChangePassword = async (values) => {
        console.log(values);
        const token = window.localStorage.getItem("accessTokenSO");

        const bodyParams = {
            'token': token,
            'oldPassword': values.oldPassword,
            'newPassword': values.newPassword,
        }
        try {
            const res = await axios.post(
                "http://localhost:3001/user/edit-user/change-password",
                bodyParams
            );

            if (res.status === 200) {
                message.success("Change profile success!");
                setIsPasswordModal(false);
            }

        } catch (err) {
            console.log(err.response);
            message.error(err.response?.data?.message);
        }
    };

    const onFinishFailedChangePassword = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };

    const handleUploadAvatar = async (e) => {
        let url = "http://localhost:3001/upload-avatar";
        let file = e.target.files[0];
        console.log("avatar", file);
        let formData = new FormData();
        formData.append("avatar", file);
        axios.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }).then((response) => {
            fnSuccess(response);
        }).catch((error) => {
            fnFail(error);
        });
    };

    const fnSuccess = (response) => {
        console.log("nb", response)
    };

    const fnFail = (error) => {
        console.log("jh", error)
    };

    return (
        <Layout>
            <div className={cx("container")}>
                <div className={cx("top")}>
                    <div className={cx("left")}>
                        <div
                            style={{ cursor: 'pointer' }}
                            onClick={() => setVisibleModalUploadAvatar(true)}
                        >
                            <Tooltip title="Click to upload new avatar">
                                {userInfo.avatar ? (
                                    <img src={userInfo.avatar} alt="avatar" />
                                ) : (
                                    <Avatar
                                        style={{
                                            backgroundColor: '#52C41A',
                                            width: '120px',
                                            height: '120px',
                                            textAlign: 'center',
                                        }}
                                    />
                                )}
                            </Tooltip>
                        </div>
                        <div className={cx("info")}>
                            <div className={cx("name")}>{userInfo.userName}</div>
                            <div className={cx("member")}>
                                <TeamOutlined /> Member in {moment(userInfo.date).format('LLL')}
                            </div>
                            <div className={cx("location")}>
                                <EnvironmentOutlined /> {userInfo.location}
                            </div>
                        </div>
                    </div>
                    <div className={cx("right")}>
                        <div
                            className={cx("button-outline")}
                            onClick={() => setIsModalVisible(true)}
                        >
                            <EditOutlined /> Edit profile
                        </div>
                        <div className={cx("button")}>
                            <PlusCircleOutlined /> Create post
                        </div>
                    </div>
                </div>
                <div className={cx("tab-navigation")}>
                    {
                        link.map((item, ind) => (
                            <div
                                className={cx(
                                    "tab-navigation-item",
                                    tabActive === (ind + 1) && "active",
                                )}
                                key={ind}
                                onClick={() => setTabActive(item.tab)}
                            >
                                {item.title}
                            </div>
                        ))
                    }
                </div>
                <div className={cx("body")}>
                    {tabActive === 1 ? (
                        <MyProfile />
                    ) : tabActive === 2 ? (
                        <MyPost />
                    ) : tabActive === 3 ? (
                        <MyAnswer />
                    ) : (
                        <FavoritePost />
                    )}
                </div>
            </div>
            <Modal
                title="Edit Profile"
                visible={isModalVisible}
                onOk={handleOk}
                footer={null}
                onCancel={handleCancel}
                autoComplete="off"
                width={720}
            >
                <Form
                    name="basic-1"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 16 }}
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Username"
                        name="username"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                    >
                        <Button onClick={() => setIsPasswordModal(true)}>
                            Change password
                        </Button>
                    </Form.Item>
                    {/* <Form.Item
                        label="Email"
                        name="email"
                    >
                        <Button onClick={() => setIsPasswordModal(true)}>
                            Change email
                        </Button>
                    </Form.Item> */}
                    <Form.Item
                        label="Facebook link"
                        name="facebookLink"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Github link"
                        name="githubLink"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Location"
                        name="location"
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Description"
                        name="description"
                    >
                        <TextArea rows={4} />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button> &nbsp; &nbsp;
                        <Button onClick={handleCancel}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Change password"
                visible={isPasswordModal}
                footer={null}
                onCancel={() => setIsPasswordModal(false)}
            >
                <Form
                    name="basic"
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 14 }}
                    onFinish={onFinishChangePassword}
                    onFinishFailed={onFinishFailedChangePassword}
                    autoComplete="off"
                >
                    <Form.Item
                        label="Old password"
                        name="oldPassword"
                        rules={[{ required: true, message: 'Please input your old password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item
                        label="New password"
                        name="newPassword"
                        rules={[{ required: true, message: 'Please input your new password!' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 8, span: 18 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button> &nbsp; &nbsp;
                        <Button onClick={() => setIsPasswordModal(false)}>Cancel</Button>
                    </Form.Item>
                </Form>
            </Modal>
            <Modal
                title="Upload Avatar"
                visible={visibleModalUploadAvatar}
                footer={null}
                onCancel={() => setVisibleModalUploadAvatar(false)}
            >
                {/* <Form
                    onFinishFailed={onFinishFailedUploadAvatar}
                    onFinish={onFinishUploadAvatar}
                >
                    <Form.Item
                        name="avatar"
                        label="Choose image"
                    >
                        <Input type="file" accept="image/*" id="file"/>
                    </Form.Item>
                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button type="primary" htmlType="submit">
                            Submit
                        </Button>
                    </Form.Item>
                </Form> */}
                <input type="file" onChange={handleUploadAvatar} accept="image/*" />
            </Modal>
        </Layout >
    )
}

export default Profile;

