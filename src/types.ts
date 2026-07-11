/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserType = 'student' | 'teacher' | 'institute';

export interface UserProfile {
  uid: string;
  fullName: string;
  username: string;
  email: string;
  bio: string;
  userType: UserType;
  profilePhoto: string;
  coverPhoto: string;
  website: string;
  location: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  verified: boolean;
  createdAt: string;
  age?: number;
  // Account details from institute registration
  instituteCountry?: string;
  instituteName?: string;
  degreeOrSubject?: string;
  registrationNo?: string;
  registrationPhoto?: string;
  instituteVerified?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  profilePhoto: string;
  text: string;
  mediaUrls: string[]; // Can support carousel or single
  mediaType: 'image' | 'video' | 'none';
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  hashtags: string[];
  location: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null; // Support nested replies
  userId: string;
  fullName: string;
  username: string;
  profilePhoto: string;
  text: string;
  likesCount: number;
  createdAt: string;
}

export interface Like {
  id: string;
  targetId: string;
  targetType: 'post' | 'comment';
  userId: string;
  createdAt: string;
}

export interface Follower {
  id: string;
  userId: string; // the host user
  followerId: string; // the person who follows them
  createdAt: string;
}

export interface Following {
  id: string;
  userId: string; // the follower
  followingId: string; // the person being followed
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  profilePhoto: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  createdAt: string;
  expiresAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  userId: string;
  username: string;
  profilePhoto: string;
  viewedAt: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageText: string;
  lastMessageTime: string;
  lastMessageSenderId: string;
  unreadCount?: { [userId: string]: number };
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  mediaUrl?: string;
  mediaType: 'text' | 'image';
  read: boolean;
  createdAt: string;
}

export type NotificationType = 'follower' | 'like' | 'comment' | 'message' | 'mention';

export interface Notification {
  id: string;
  receiverId: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  type: NotificationType;
  targetId: string; // postId, messageId, etc.
  text: string;
  read: boolean;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetId: string;
  targetType: 'post' | 'comment';
  reason: string;
  createdAt: string;
}

export interface Reel {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  profilePhoto: string;
  videoUrl: string;
  caption: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  createdAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  fullName: string;
  username: string;
  profilePhoto: string;
  activityType: 'signup' | 'login' | 'create_post' | 'delete_post' | 'like_post' | 'add_comment' | 'follow' | 'unfollow' | 'send_message' | 'create_story' | 'create_reel';
  activityDetails: string;
  targetId: string;
  createdAt: string;
}

