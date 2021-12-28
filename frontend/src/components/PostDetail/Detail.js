import React, { useEffect, useState } from 'react';
import styles from './PostDetail.module.scss';
import cn from 'classnames/bind';
import { Row, Col, Avatar } from 'antd';
import { CaretDownOutlined, CaretUpOutlined, CheckCircleOutlined, CheckCircleTwoTone, HeartOutlined, HeartTwoTone, PlusCircleOutlined } from '@ant-design/icons';
import { useHistory, useParams } from 'react-router-dom';
import { Tag } from 'antd';
import ReactMarkdown from 'react-markdown';
import { URL, token } from '../../const/index';
import axios from "axios";
import Loading from '../common/Loading';
import moment from 'moment';

const cx = cn.bind(styles);

const Detail = () => {
	const history = useHistory();
	const { id } = useParams();
	const [markdownContent, setMarkdownContent] = useState();
	const [postData, setPostData] = useState();
	const [loading, setLoading] = useState(true);
	const [listAnswer, setListAnswer] = useState();
	const [orderBy, setOrderBy] = useState('upVoteNum');
	const [voteType, setVoteType] = useState();
	const [voteAnswer, setVoteAnswer] = useState();
	const [voteOfPost, setVoteOfPost] = useState();

	useEffect(() => {
		getPostDetail();
		getVoteOfPost();
		getListAnswer();
	}, []);

	const getPostDetail = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${URL}/post/id/${id}`);
			if (res.status === 200) {
				setPostData(res.data.result);
				setLoading(false);
			}
		} catch (err) {
			console.log(err);
		}
	}

	const getListAnswer = async () => {
		try {
			const res = await axios.get(`${URL}/answer/list?page=1&perPage=1000&postId=${id}`);
			if (res.status === 200) {
				setListAnswer(res.data.result.data);
			}
		} catch (err) {
			console.log(err.response);
		}
	}

	const getVoteOfPost = async () => {
		try {
			const res = await axios.get(`${URL}/post/vote-num?postId=${id}`);
			if (res.status === 200) {
				setVoteOfPost(res.data.result);
			}
		} catch (err) {
			console.log(err.response);
		}
	}

	const handleVotePost = async (voteType) => {
		const check = await checkUserVotedPost();
		if (!check.length || voteType != check[0]?.voteType) {
			handleCreateVoteForPost(voteType);
		} else if (voteType == check[0]?.voteType) {
			handleDeleteVoteForPost();
		}
	}

	const handleCreateVoteForPost = async (voteType) => {
		const bodyParams = {
			token: token,
			postId: id,
			voteType: voteType,
		};


		try {
			const res = await axios.post(`${URL}/post/user/create-vote`, bodyParams);
			if (res.status === 200) {
				getVoteOfPost();
			}
		} catch (err) {
			console.log(err.response);
		}
	}

	const handleDeleteVoteForPost = async () => {
		const bodyParams = {
			token: token,
			postId: id,
		};

		try {
			const res = await axios.post(`${URL}/post/user/delete-vote`, bodyParams);
			if (res.status === 200) {
				getVoteOfPost();
			}
		} catch (err) {
			console.log(err.response);
		}
	}

	const checkUserVotedPost = async () => {
		const bodyParams = {
			token: token,
			postId: id,
		}

		try {
			const res = await axios.post(`${URL}/post/user/get-vote`, bodyParams);
			if (res.status == 200) {
				return res.data.result;
			}
		} catch (err) {
			console.log(err.response);
		}
	}

	return (
		<div className={cx("post-detail")}>
			{loading ? (<Loading />) : (
				<div className={cx("container")}>
					<div className={cx("header")}>
						<Row>
							<Col span={20}>
								<div className={cx("title")}>
									{postData.postName}
								</div>
								<div className={cx("info")}>
									<div className={cx("oneField")}>
										<span className={cx("name")}>Posted: </span>
										<b className={cx("view")}>{moment(postData.date, 'YYYY-MM-DD').fromNow()}</b>
									</div>
									<div className={cx("oneField")}>
										<span className={cx("name")}>Views: </span>
										<b className={cx("view")}>{postData.viewNum}</b>
									</div>
									<div className={cx("oneField")}>
										<span className={cx("name")}>Answer: </span>
										<b className={cx("view")}>{postData.numAnswer}</b>
									</div>
									<div className={cx("oneField")}>
										<span className={cx("name")}>Author: </span>
										<b className={cx("view")}>{postData.postUserName}</b>
									</div>
								</div>
							</Col>
							<Col span={4}>
								<div className={cx("button")} onClick={() => history.push("/posts/create-post")}>
									<PlusCircleOutlined /> Create new post
								</div>
							</Col>
						</Row>
					</div>
					<div className={cx("division")}></div>
					<div className={cx("question")}>
						<Row>
							<Col span={3}>
								<div className={cx("upDown")}>
									<div
										className={cx("icon")}
										className={cx("click-icon")}
										onClick={() => {
											setVoteType(true);
											handleVotePost(true);
										}}
									><CaretUpOutlined /></div>
									<div>{voteOfPost ? voteOfPost.upVote - voteOfPost.downVote : '0'}</div>
									<div
										className={cx("icon")}
										className={cx("click-icon")}
										onClick={() => {
											setVoteType(false);
											handleVotePost(false);
										}}
									><CaretDownOutlined /></div>
								</div>
								<div className={cx("favorite")}>
									<HeartTwoTone twoToneColor="#f5222d" className={cx("click-icon")} />
									<div style={{ fontSize: '14px', fontWeight: 'bold', color: "#8c8c8c" }}>{postData.likeNum} likes</div>
								</div>
							</Col>
							<Col span={17}>
								<div className={cx("postDetail")}>
									<ReactMarkdown>
										{postData.postDetail}
									</ReactMarkdown>
								</div>
							</Col>
							<Col span={4}>
								{postData.postTags ? postData.postTags?.map((tag, idx) => (
									<Tag color="geekblue" key={idx}>{tag.tagName}</Tag>
								)) : (<></>)}
								<div className={cx("author")}>
									<Avatar /> &nbsp; &nbsp;
									<span>{postData.postUserName}</span>
								</div>
							</Col>
						</Row>
					</div>
					<div className={cx("division")}></div>
					<div className={cx("answer")}>
						<div className={cx("answer-header")}>
							<h1>{postData.numAnswer} Answers</h1>
							<div className={cx("groupButton")}>
								<div
									className={cx("button", orderBy === "upVoteNum" && "active")}
									onClick={() => setOrderBy("upVoteNum")}
								>Votes</div>
								<div
									className={cx("button", orderBy === "date" && "active")}
									onClick={() => setOrderBy("date")}
								>Oldest</div>
							</div>
						</div>
						<div className={cx("division")}></div>
						{!listAnswer ? (<></>) :
							listAnswer.map((answer, idx) => (
								<div key={idx}>
									<Row>
										<Col span={3}>
											<div className={cx("upDown")}>
												<div className={cx("icon")} className={cx("click-icon")}><CaretUpOutlined /></div>
												<div>{answer.upVoteNum - answer.downVoteNum}</div>
												<div className={cx("icon")} className={cx("click-icon")}><CaretDownOutlined /></div>
											</div>
											<div className={cx("favorite")}>
												{answer.Id === postData.rightAnswerID && <CheckCircleTwoTone twoToneColor="#52c41a" />}
											</div>
										</Col>
										<Col span={17}>
											<div className={cx("postDetail")}>
												<ReactMarkdown>
													{answer.answerDetail}
												</ReactMarkdown>
											</div>
										</Col>
										<Col span={4}>
											<div>{moment(answer.date, 'YYYY-MM-DD').fromNow()}</div>
											<div className={cx("author")}>
												<Avatar /> &nbsp; &nbsp;
												<span>{answer?.postUserName}</span>
											</div>
										</Col>
									</Row>
									<div className={cx("division")}></div>
								</div>
							))
						}
					</div>
					{/* <div className={cx("division")}></div> */}
					<div className={cx("write-answer")}>
						<h1>Your answer</h1>
						<div className={cx("content")}>
							<div className={cx("markdown")}>
								<b>Markdown</b>
								<textarea
									placeholder='e.g. # Git'
									className={cx("input")}
									onChange={(e) => setMarkdownContent(e.target.value)}
									style={{ marginTop: '10px' }}
									rows={10}
								/>
							</div>
							<div className={cx("markdown")}>
								<b>Preview</b>
								<div className={cx("box")}>
									<ReactMarkdown>
										{markdownContent}
									</ReactMarkdown>
								</div>
							</div>
						</div>
						<div className={cx("btn")}>
							Post your answer
						</div>
					</div>
				</div>
			)
			}
		</div >
	)
}

export default Detail;