export class ShoppeMeView {
  id: string;
  email: string | null;
  username: string | null;

  constructor(id: string, email: string | null, username: string | null) {
    this.id = id;
    this.email = email;
    this.username = username;
  }
}
