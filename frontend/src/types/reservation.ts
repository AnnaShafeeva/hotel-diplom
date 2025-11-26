export interface Reservation {
  _id?: string;
  userId: string;
  hotelId: string;
  roomId: string;
  dateStart: string;
  dateEnd: string;
}

export interface ReservationWithDetails {
  id: string;
  startDate: string;
  endDate: string;
  hotelRoom: {
    description: string;
    images: string[];
  };
  hotel: {
    title: string;
    description: string;
  };
}

export interface ReservationSearchOptions {
  userId?: string;
  dateStart?: string;
  dateEnd?: string;
}

export interface CreateReservationData {
  hotelRoom: string;
  startDate: string;
  endDate: string;
}

export interface ReservationResponse {
  startDate: string;
  endDate: string;
  hotelRoom: {
    description: string;
    images: string[];
  };
  hotel: {
    title: string;
    description: string;
  };
}