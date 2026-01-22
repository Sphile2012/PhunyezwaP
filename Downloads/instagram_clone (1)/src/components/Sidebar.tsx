import { mockUsers } from '@/data/mockData';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Sidebar = () => {
  const suggestedUsers = mockUsers.slice(0, 3);

  return (
    <div className="hidden lg:block w-80 pl-8">
      <div className="sticky top-20">
        {/* User Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Avatar className="w-14 h-14">
                <AvatarImage src="/images/profile_pics_7.jpeg" alt="Your profile" />
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-semibold">your_username</h3>
                <p className="text-sm text-gray-500">Your Name</p>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-500 font-semibold">
                Switch
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-gray-500">
                Suggestions For You
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs font-semibold">
                See All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-1">
                      <h4 className="font-semibold text-sm">{user.username}</h4>
                      {user.isVerified && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">Suggested for you</p>
                  </div>
                  <Button variant="ghost" size="sm" className="text-blue-500 font-semibold text-xs">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-xs text-gray-400 space-y-1">
          <div className="flex flex-wrap gap-2">
            <span>About</span>
            <span>Help</span>
            <span>Press</span>
            <span>API</span>
            <span>Jobs</span>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span>Locations</span>
            <span>Language</span>
            <span>Meta Verified</span>
          </div>
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <span>© 2024 Developed by Phumeh</span>
              <a
                href="https://github.com/Sphile2012/PhunyezwaP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-xs"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};