

async function testTeamFlow() {
    const baseUrl = 'http://localhost:3000/api/teams';

    console.log('1. Creating Team...');
    const createRes = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'BugTest Team', logo_url: 'http://test.com/1.png' })
    });

    if (!createRes.ok) {
        console.error('Create failed:', await createRes.text());
        return;
    }

    const createData = await createRes.json();
    const teamId = createData.data.id;
    console.log('Team Created:', teamId);

    console.log('2. Updating Team...');
    const updateRes = await fetch(`${baseUrl}/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'BugTest Team Updated', logo_url: 'http://test.com/2.png' })
    });

    if (!updateRes.ok) {
        console.error('Update failed:', await updateRes.text());
        return;
    }

    const updateData = await updateRes.json();
    console.log('Team Updated:', updateData);

    if (updateData.data.name === 'BugTest Team Updated') {
        console.log('SUCCESS: Name updated correctly.');
    } else {
        console.error('FAILURE: Name NOT updated.');
    }
}

testTeamFlow();
