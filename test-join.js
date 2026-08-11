async function test() {
  try {
    const res = await fetch('http://localhost:5000/api/auth/join-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId: 'usr_1785925140234_o9fkx', coachCode: 'COACH-COAC-2312' })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

test();
