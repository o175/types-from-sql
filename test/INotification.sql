-- @InterfaceName: INotification
select
fn.*,
u.*

from   users.front_notification fn join users."user" u using (user_id)
