export interface HttpResult<T> {
  result: T;
}

export type Result<N extends string | number | symbol, T> = {
  [key in N]: T;
};

export interface UserInfo {
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp: {
    url: string;
  };
  profile: {
    bio: {
      text: string;
      mentioned_profiles: string[];
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: `0x${string}`[];
    sol_addresses: string[];
  };
  active_status: boolean;
  viewer_context: {
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
    username: string;
    fid: number;
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
