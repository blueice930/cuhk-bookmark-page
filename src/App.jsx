import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setisDeleting] = useState(false);
  const [isAlertShown, setIsAlertShown] = useState(false)
  const [alertTxt, setAlertTxt] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    const queryStr = window.location.search;
    const urlParams = new URLSearchParams(queryStr);
    const emailParam = urlParams.get('email');

    if (emailParam) {
      setEmail(emailParam);
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailParam })
      };
      const response = await fetch(
        'https://asia-east2-eventx-ronnie.cloudfunctions.net/fetchBookmarks',
        requestOptions,
      );
      const resData = await response.json();
      setData(resData.data);
    } else {
      setData(null)
    }
    setIsLoading(false);
    // console.log('data', resData.data);
  }

  const deleteItem = async (item) => {
    setisDeleting(true);
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        name: item.name,
        url: item.url,
      })
    }
    const response = await fetch(
      'https://asia-east2-eventx-ronnie.cloudfunctions.net/removeBookmark',
      requestOptions,
    );
    const resJSON = await response.json();
    console.log('resJSON', resJSON)
    if (resJSON.success) {
      setData(data.filter(e => item.name !== e.name || item.url !== e.url));
    } else {
      setAlertTxt('An error occurred when deleting the item, please try again later.');
      setIsAlertShown(true);
    }
    setisDeleting(false);
  }

  useEffect(() => {
    fetchData();
  }, [])
  
  return (
    <div className="App">
      <div className="container">
        <h2 className='main-title'>Bookmarked Webinars</h2>
        {
          isAlertShown && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {alertTxt}
              <button type="button" className="btn-close" onClick={() => setIsAlertShown(false)} data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )
        }
        {
          isLoading ? (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : (
          <ul className="list-group">
            {(data?.length === 0) && 
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                There is no bookmarked item.
              </div>
            }
            {(!data) && 
              <div className="alert alert-danger alert-dismissible fade show" role="alert">
                Fetching data error, please check your email.
              </div>
            }
            {
              data?.map((item, index) => (
                <li key={index} className="list-group-item bookmark-list-item">
                  <div className="item-detail">
                    <div className="date-time">
                      {item.name.split(': ')[0]}
                    </div>
                    <div className="session-name">
                      {item.name.split(': ')[1]}
                    </div>
                  </div>
                  
                  <div className="button-group">
                    <a className="btn btn-primary watch-button" href={item.url} target='_parent' rel='noreferrer'>
                      Watch now
                    </a>
                    <div className="divider"></div>
                    <button className="btn btn-danger delete-button" disabled={isDeleting} onClick={() => deleteItem(item)}>
                      { isDeleting && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> }
                      Remove
                    </button>
                  </div>
                </li>
              ))
            }
            
          </ul>
        )
        }
        <div className="footer">
          <button disabled={isLoading} className="btn btn-primary reload-btn" onClick={() => fetchData()}>
            { isLoading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> }
            Reload
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
