export interface Label {
  id: string;
  name: string;
  color: string;
  teamId: string;
}

export interface CreateLabelDto {
  name: string;
  color: string;
}
