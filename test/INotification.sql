-- @InterfaceName: INotification
select
fn.*,
u.login_ipa as "loginIpa"
from   users.front_notification fn join users."user" u using (user_id)
