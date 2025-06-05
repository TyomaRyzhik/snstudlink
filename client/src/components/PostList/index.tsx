import React from 'react';
import { Box } from '@mui/material';
import { Post } from '../../types';
import PostComponent from '../Post';

interface PostListProps {
  posts: Post[];
}

const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <Box>
      {posts.map((post) => (
        <PostComponent key={post.id} {...post} />
      ))}
    </Box>
  );
};

export default PostList; 