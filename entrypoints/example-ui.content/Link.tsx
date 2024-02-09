import './Link.css';

function Link() {
  // get div#user_id from the DOM
  const user_id = document.getElementById('user_id')?.textContent;

  const userDetailLink = `https://replaceIt.com/users/${user_id}`;

  return (
    <div>
      {user_id && (
        <a href={userDetailLink} target="_blank">
          유저 상세
        </a>
      )}
    </div>
  );
}

export default Link;
