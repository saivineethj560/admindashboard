
// Room groups data as a constant
export const ROOM_GROUPS = [
  [
    {
      number: "Block 1",
      location: "Old Conference Room",
      color: "bg-purple-500",
      bgColor: "bg-[#af7ad5]",
      apiRoom: "Old Conference Room",
      borderColor: "border-purple-600"
    },
    {
      number: "Block 1",
      location: "Video Conference Room(New)",
      color: "bg-yellow-500",
      bgColor: "bg-[#FFF574]",
      apiRoom: "Video Conference Room(New)",
      borderColor: "border-yellow-600"
    },
    {
      number: "Block 3",
      location: "Conference Room 2",
      color: "bg-blue-500",
      bgColor: "bg-[#f37878]",
      apiRoom: "Conference Room 2",
      borderColor: "border-red-600"
    }
  ],
  [
    {
      number: "Block 1",
      location: "Meeting Room 1(Glass)",
      color: "bg-green-500",
      bgColor: "bg-[#90EE90]",
      apiRoom: "Meeting Room 1(Glass)",
      borderColor: "border-green-600"
    },
    {
      number: "Block 1",
      location: "Meeting Room 2(Glass)",
      color: "bg-cyan-500",
      bgColor: "bg-[#87CEEB]",
      apiRoom: "Meeting Room 2(Glass)",
      borderColor: "border-cyan-600"
    },
    {
      number: "Hyma",
      location: "Mini Conference Room",
      color: "bg-orange-500",
      bgColor: "bg-[#FFB347]",
      apiRoom: "Mini Conference Room",
      borderColor: "border-orange-600"
    },
    {
      number: "Hyma",
      location: "Main Conference Room",
      color: "bg-red-500",
      bgColor: "bg-[#FF6B6B]",
      apiRoom: "Main Conference Room",
      borderColor: "border-red-600"
    }
  ]
];

// Helper function to get room by API name
export const getRoomByApiName = (apiRoom) => {
  for (const group of ROOM_GROUPS) {
    for (const room of group) {
      if (room.apiRoom === apiRoom) {
        return room;
      }
    }
  }
  return null;
};

// Helper function to get all rooms as flat array
export const getAllRooms = () => {
  return ROOM_GROUPS.flat();
};

// Component for room groups if you want to use it as a component
export const RoomGroupsProvider = ({ children }) => {
  return children;
};

export default ROOM_GROUPS;