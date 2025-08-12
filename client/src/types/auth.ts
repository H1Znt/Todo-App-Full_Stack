export interface UserDTO {
  id: number;
  username: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
  user?: UserDTO;
}
