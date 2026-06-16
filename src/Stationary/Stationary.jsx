import React, { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { Link,useLocation,useNavigate } from "react-router-dom";
import Swal from 'sweetalert2';
import '../assets/styles/style.css';
import 'sweetalert2/dist/sweetalert2.min.css';
import { DataGrid } from '@mui/x-data-grid';
import { Box,IconButton, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { API_BASE_URL } from '../Config';

const DataTable = () => 
{
const loaderStyle = {
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #3498db',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    animation: 'spin 1s linear infinite',
    margin: '50px auto',
    };
  const [searchText, setSearchText] = useState('');
  const [data, setData] = useState([]);
  const [loading,setLoading] =useState(true);
   const location =useLocation();
   const navigate=useNavigate();
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 5,
    page: 0,
  });
  const [userToken,setUserToken] = useState(()=>
    {
        return JSON.parse(localStorage.getItem('userInfo'))||{};
    })
    //console.log(userToken.token);
  const fetchData = async()=>
 {
    setLoading(true);
    try
    {
     const response = await axios.get(`${API_BASE_URL}getData`
      ,
      {
      headers:
      {
          "Content-Type":"application/json",
           Accept:'application/json',
          Authorization:`Bearer  ${userToken.token}`
        }
    }) 
     if(response.data && Array.isArray(response.data.data))
     {
        setData(response.data.data);
     }
    }
    catch(error)
    {
      console.error("Data is not in the Array Format here---");
    }finally
    {
     setLoading(false);
    }
  }
    useEffect(() => 
      { 
        setTimeout(()=>
        {
          fetchData(); // ✅ Force refresh if navigating from MyForm
          setLoading(false);
        },1000)    
        }, 
    []);
  
      useEffect(() => 
      {
          if (location.state?.refresh) 
         {
            fetchData(); // ✅ Force refresh if navigating from MyForm
          }
        }, [location]);
      useEffect(()=>
      {
       if(!userToken.token)
      {
        navigate('/')
       }
      },[navigate,userToken?.token])


  const handleSearch = (e) => 
  {
    setSearchText(e.target.value);
    setPaginationModel({...paginationModel,page:0}); // Reset page on search
  };

  const filteredRows = useMemo(() => 
{
    const lowerSearch = searchText.toLowerCase();
    return data.filter((row) => {
      const valuesToSearch = [
         row.name || '',
         row.email || '',
         row.RaiserFor || '',
         row.Status || ''
      ].join(' ').toLowerCase();
  
      return valuesToSearch.includes(lowerSearch);
    });
  }, [searchText, data]);
    
      const handleApprove = (case_id,status) => 
        {
        Swal.fire({
          title: 'Are you sure?',
          text: 'Do you want to approve this request?',
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#388e3c', // green
          cancelButtonColor: '#d32f2f',  // red
          confirmButtonText: 'Yes, Approve',
          cancelButtonText: 'Cancel',
          showClass: {
            popup: 'swal2-animate-show'
          },
          hideClass: {
            popup: 'swal2-animate-hide'
          }
        }).then(async (result) => {
          if (result.isConfirmed) {
                  try {
                      const response = await fetch(`${API_BASE_URL}hod_approve`, {
                          method: "PUT",
                          headers: { 
                              "Content-Type": "application/json",
                              "Accept":"application/json",
                              Authorization:`Bearer ${userToken.token}`
                          },
                          body: JSON.stringify({ caseId: case_id ,Status:status }),
                      });
                      if (response.ok) {
                          Swal.fire({
                              title: "Approved!",
                              icon: "success",
                              toast: true,
                              position: "top-end",
                              showConfirmButton: false,
                              timer: 2000,
                          });
                          fetchData(); // Refresh data
                      } else {
                          throw new Error("Failed to approve");
                      }
                  } catch (error) {
                      Swal.fire({
                          title: "Error!",
                          text: "Something went wrong ❌",
                          icon: "error",
                          toast: true,
                          position: "top-end",
                          showConfirmButton: false,
                          timer: 2000,
                      });
                  }
          }
        });
      };
      
        const handleReject = (case_id,status) => {
          Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to reject this request?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#616161',
            confirmButtonText: 'Yes, Reject',
            cancelButtonText: 'Cancel',
            showClass: {
              popup: 'swal2-animate-show'
            },
            hideClass: {
              popup: 'swal2-animate-hide'
            }
            
          }).then(async(result) => {
            if (result.isConfirmed) {
              try {
                  const response = await fetch(`${API_BASE_URL}hod_approve`, {
                      method: "PUT",
                      headers: { 
                          "Content-Type": "application/json",
                          Accept:"application/json",
                          Authorization:`Bearer ${userToken.token}`
                       },
                      body: JSON.stringify({ caseId: case_id ,Status:status}),
                  });

                  if (response.ok) {
                      Swal.fire({
                          title: "Rejected!",
                          text: `User ID ${case_id} has been rejected ❌`,
                          icon: "error",
                          toast: true,
                          position: "top-end",
                          showConfirmButton: false,
                          timer: 2000,
                      });
                      fetchData(); // Refresh data
                  } else {
                      throw new Error("Failed to reject");
                  }
              } catch (error) {
                  Swal.fire({
                      title: "Error!",
                      text: "Something went wrong ❌",
                      icon: "error",
                      toast: true,
                      position: "top-end",
                      showConfirmButton: false,
                      timer: 2000,
                  });
              }
          }
          });
        };


  const columns = [
    { field: 'stationary_id', headerName: 'Emp Id', width: 150 },
    { field: 'name', headerName: 'Name', width: 170 },
    { field: 'email', headerName: 'Email',  width: 150 },
    { field: 'RaiserFor', headerName: 'Hod',  width: 150 },
    
    {
        field: 'Status',
        headerName: 'Status',
        sortable: false,
        width: 180,
        renderCell: (params) => {
          const status = params.value;
          const getBackgroundColor = (status) => 
            {
            switch (status) 
            {
              case 'Approve':
                return 'green'; // green
              case 'Reject':
                return '#f44336'; // red
              default:
                return '#9e9e9e'; // gray for others
            }
          };
      
          return (
            <Box
                sx={{
                marginTop: '10px',
                borderRadius: '5px',
                backgroundColor: getBackgroundColor(status),
                color: 'white',
                textAlign: 'center',
                fontWeight: "bold",
                width: '40%',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                }}
            >
            {status}
          </Box>
          
          );
        },
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 130,
        sortable: false,
        renderCell: (params) => {
          const status = params.row.Status;
      
          // Only Reject button if status is "Approve"
          if (status === "Approve") {
            return (
              <Box display="flex" gap={1}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'error.main',
                    color: 'white',
                    borderRadius: 1,
                    marginTop: 1,
                    cursor: 'pointer',
                    boxShadow: 1,
                    '&:hover': {
                      bgcolor: 'error.dark',
                    },
                  }}
                  onClick={() => handleReject(params.row.case_id, "Reject")}
                >
                  <CancelIcon fontSize="small" />
                </Box>
              </Box>
            );
          }
      
          // No buttons if status is "Reject"
          if (status === "Reject") {
            return null;
          }
      
          // Show both buttons if status is neither "Approve" nor "Reject"
          return (
            <Box display="flex" gap={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  marginTop: 1,
                  cursor: 'pointer',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                onClick={() => handleApprove(params.row.case_id, "Approve")}
              >
                <CheckCircleIcon fontSize="small" />
              </Box>
      
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'error.main',
                  color: 'white',
                  borderRadius: 1,
                  marginTop: 1,
                  cursor: 'pointer',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'error.dark',
                  },
                }}
                onClick={() => handleReject(params.row.case_id, "Reject")}
              >
                <CancelIcon fontSize="small" />
              </Box>
            </Box>
          );
        },
      }
      
  ];
  return (
    <Paper sx={{ height: 440, width: '100%',  padding: 2 }}>
      <input
        type="text"
        placeholder="Search..."
        value={searchText}
        onChange={handleSearch}
        className="border p-2 rounded mb-4 w-50"
      />
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        getRowId={(row) => row.stationary_id} // 👈 This line fixes the error
        rowCount={filteredRows.length}
        pagination
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 15]}
        checkboxSelection
        getRowClassName={(params) => (params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row')}
        sx={{ border: 0, mt: 2 , '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 'bold', // Makes header text bold
          },
                '& .even-row': {
            backgroundColor: '#f9f9f9', // Light gray
            },
            '& .odd-row': {
            backgroundColor: '#ffffff', // White
            },
        }}
      />
    </Paper>
  );
};

export default DataTable;
