import { useState } from 'react';
import {
  AppBar,
  Breadcrumbs,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { makeStyles } from 'tss-react/mui';
import MenuIcon from '@mui/icons-material/Menu';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from './LocalizationProvider';

const useStyles = makeStyles()((theme) => ({
  root: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileDrawer: {
    width: theme.dimensions.drawerWidthTablet,
    '@media print': {
      display: 'none',
    },
  },
  mobileToolbar: {
    zIndex: 1,
    '@media print': {
      display: 'none',
    },
  },
  content: {
    flexGrow: 1,
    alignItems: 'stretch',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
}));

const PageTitle = ({ breadcrumbs }) => {
  const t = useTranslation();

  return (
    <Breadcrumbs>
      {breadcrumbs.slice(0, -1).map((breadcrumb) => (
        <Typography variant="h6" color="inherit" key={breadcrumb}>
          {t(breadcrumb)}
        </Typography>
      ))}
      <Typography variant="h6" color="textPrimary">
        {t(breadcrumbs[breadcrumbs.length - 1])}
      </Typography>
    </Breadcrumbs>
  );
};

const PageLayout = ({ menu, breadcrumbs, children }) => {
  const { classes } = useStyles();
  const theme = useTheme();

  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const [searchParams] = useSearchParams();
  const [openDrawer, setOpenDrawer] = useState(!desktop && searchParams.has('menu'));

  return (
    <div className={classes.root}>
      {!desktop && (
        <>
          <Drawer
            variant="temporary"
            open={openDrawer}
            onClose={() => setOpenDrawer(false)}
            classes={{ paper: classes.mobileDrawer }}
          >
            {menu}
          </Drawer>
          <AppBar className={classes.mobileToolbar} position="static" color="inherit">
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                sx={{ mr: 2 }}
                onClick={() => setOpenDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <PageTitle breadcrumbs={breadcrumbs} />
            </Toolbar>
          </AppBar>
        </>
      )}
      <div className={classes.content}>{children}</div>
    </div>
  );
};

export default PageLayout;
