export interface HttpResult<T> {
  result: T;
}

type Result<N extends string | number | symbol, T> = {
  [key in N]: T;
};

export interface UserInfo {
  fid: number;
  custodyAddress: string;
  username: string;
  displayName: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
      mentionedProfiles: string[];
    };
  };
  followerCount: number;
  followingCount: number;
  verifications: string[];
  verifiedAddresses: {
    eth_addresses: `0x${string}`[];
    sol_addresses: string[];
  };
  activeStatus: boolean;
  viewerContext: {
    following: boolean;
    follower: boolean;
  };
}
export type UserResult = Result<"user", UserInfo>;

export interface Cast {
  object: "cast";
  hash: `0x${string}`;
  thread_hash: `0x${string}`;
  parent_hash: `0x${string}`;
  parent_url: null | string;
  root_parent_url: null | string;
  parent_author: {
    fid: number;
  };
  author: {
    pfp_url: string;
  };
  text: string;
  timestamp: string;
  embeds: { url: string }[];
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: { fid: number; fname: string }[];
    recasts: { fid: number; fname: string }[];
  };
  replies: { count: number };
  mentioned_profiles: string[];
}

export type CastResult = Result<"cast", Cast>;
