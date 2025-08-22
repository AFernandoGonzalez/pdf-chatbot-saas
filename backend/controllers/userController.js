import User from '../models/User.js';

export const getOrCreateUser = async (req, res) => {
  try {
    const firebaseUser = req.user;
    if (!firebaseUser) return res.status(401).json({ error: 'Unauthorized' });

    const { uid, email, name: displayName, picture: photoURL } = firebaseUser;

    const user = await User.findOneAndUpdate(
      { uid },
      {
        $set: {
          email,
          displayName: displayName || undefined,
          photoURL: photoURL || undefined,
          lastLogin: new Date()
        }
      },
      { 
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.json(user);
  } catch (err) {
    console.error('getOrCreateUser error:', err);
    res.status(500).json({ error: 'Failed to fetch or create user' });
  }
};

export const updateUser = async (req, res) => {
  try {
    const firebaseUser = req.user;
    if (!firebaseUser) return res.status(401).json({ error: 'Unauthorized' });

    const { preferences, displayName, photoURL } = req.body;

    const user = await User.findOne({ uid: firebaseUser.uid });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;

    await user.save();

    res.json(user);
  } catch (err) {
    console.error('updateUser error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};
